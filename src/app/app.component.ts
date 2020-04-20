import { Component } from '@angular/core';
import { CdkDragDrop, CdkDragEnter, CdkDragExit, moveItemInArray, transferArrayItem, copyArrayItem } from '@angular/cdk/drag-drop';
import { Guid } from './guid';

export class Node {
  id?: string;
  children?: Node[];
  type: string;
}

const TREE_DATA: Node[] = [
  {
    type: 'container',
    id: 'r',
    children: [
      {
        type: 'container',
        id: '1',
        children: [{
          type: 'container',
          id: '4',
          children: [{
            type: 'item',
            id: '5',
            children: []
          }]
        },
        {
          type: 'item',
          id: '6',
          children: []
        }]
      },
      {
        type: 'item',
        id: '2',
        children: []
      },
      {
        type: 'item',
        id: '3',
        children: []
      }
    ]
  },
  {
    type: 'item',
    id: '7',
    children: []
  },
  {
    type: 'item',
    id: '8',
    children: []
  }
];

const NEW_ELEMENTS: Node[] = [
  {
    type: 'item'
  },
  {
    type: 'container'
  }
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  root: Node;
  newElements: Node[];

  get nestedContainersDropListIds(): string[] {
    // We reverse ids here to respect items nesting hierarchy
    const recursiveIds = this.getIdsRecursive(this.root).reverse();
    // recursiveIds.splice(0, 0, 'newElementList');
    return recursiveIds;
  }

  get trashDropListIds(): string[] {
    // We reverse ids here to respect items nesting hierarchy
    const recursiveIds = this.getIdsRecursive(this.root).reverse();
    recursiveIds.push('trashList');
    return recursiveIds;
  }

  constructor() {
    this.root = {
      id: 'root',
      type: 'container',
      children: TREE_DATA
    };

    this.newElements = NEW_ELEMENTS;
  }

  public onDragDrop(event: CdkDragDrop<Node[]>) {
    const containerData: Node[] = event.container.data;
    const previousContainerData: Node[] = event.previousContainer.data;
    if (previousContainerData === containerData) {
      moveItemInArray(containerData, event.previousIndex, event.currentIndex);
    } else if (this.newElements === previousContainerData) {
      const item = previousContainerData[event.previousIndex];
      const itemToCopy: Node = { id: Guid.newGuid(), type: item.type, children: [] };
      // copyArrayItem(previousContainerData, containerData, event.previousIndex, event.currentIndex);
      containerData.splice(event.currentIndex, 0, itemToCopy);
    } else {
      transferArrayItem(previousContainerData,
        containerData,
        event.previousIndex,
        event.currentIndex);
    }
  }

  public onDropToTrash(event: CdkDragDrop<Node[]>) {
    const containerData: Node[] = event.container.data;
    const previousContainerData: Node[] = event.previousContainer.data;
    previousContainerData.splice(event.previousIndex, 1);
  }

  private canBeDropped(event: CdkDragDrop<Node, Node>): boolean {
    const movingItem: Node = event.item.data;

    return event.previousContainer.id !== event.container.id
      && this.isNotSelfDrop(event)
      && !this.hasChild(movingItem, event.container.data);
  }

  private isNotSelfDrop(event: CdkDragDrop<Node> | CdkDragEnter<Node> | CdkDragExit<Node>): boolean {
    return event.container.data.id !== event.item.data.id;
  }

  private hasChild(parent: Node, child: Node): boolean {
    const hasChild = parent.children.some((item) => item.id === child.id);
    return hasChild ? true : parent.children.some((item) => this.hasChild(item, child));
  }

  private getIdsRecursive(item: Node): string[] {
    let ids = [item.id];
    item.children.forEach((childItem) => { ids = ids.concat(this.getIdsRecursive(childItem)); });
    return ids;
  }
}
