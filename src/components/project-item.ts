// ProjectItem class
import { Component } from "./base-component";
import { Autobind } from "../decorators/autobind";
import type { Draggable } from "../models/drag-drop";
import type { Project } from "../models/project";

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} people`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler() {
    // eslint-disable-next-line no-console
    console.log("DragEnd");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.innerText = this.project.title;
    this.element.querySelector("h3")!.innerText = this.persons + " assigned";
    this.element.querySelector("p")!.innerText = this.project.description;
  }
}
