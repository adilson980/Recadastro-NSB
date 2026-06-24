import * as ReactDOMOriginal from '../node_modules/react-dom/index.js';

export const findDOMNode = (componentOrElement: any): any => {
  if (!componentOrElement) return null;
  if (componentOrElement instanceof HTMLElement) {
    return componentOrElement;
  }
  if (typeof componentOrElement === 'object') {
    const fiber = componentOrElement._reactInternals || componentOrElement._reactInternalFiber;
    if (fiber) {
      let currentFiber = fiber;
      while (currentFiber) {
        if (currentFiber.stateNode instanceof HTMLElement) {
          return currentFiber.stateNode;
        }
        currentFiber = currentFiber.child;
      }
    }
    if (componentOrElement.current instanceof HTMLElement) {
      return componentOrElement.current;
    }
    if (componentOrElement.stateNode instanceof HTMLElement) {
      return componentOrElement.stateNode;
    }
  }
  return null;
};

const ReactDOMCompat = {
  ...ReactDOMOriginal,
  findDOMNode
};

export * from '../node_modules/react-dom/index.js';
export default ReactDOMCompat;
