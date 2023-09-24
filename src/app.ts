// Project State Management class

type Listener = (items: Array<Project>) => void;

class ProjectState {
    private listeners: Array<Listener> = [];
    private projects: Array<Project> = [];
    private static instance: ProjectState;

    private constructor() {

    }

    static getInstance() {
        if (this.instance) {
            return this.instance
        }

        this.instance = new ProjectState();
        return this.instance;
    }

    addListener(listenerFn: Listener){
        this.listeners.push(listenerFn);
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.ACTIVE);

        this.projects.push(newProject);

        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable) {
    let isValid = true;

    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === "string") {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === "string") {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }

    return isValid;
}



// Autobind Decorator
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn
        }
    }
    return adjustedDescriptor;
}

// Project status type
enum ProjectStatus  {
    ACTIVE,
    FINISHED
}

// Project class
class Project {
    constructor(public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus) {
    }
}

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;

        if(newElementId) {
            this.element.id = newElementId;
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? "afterbegin" : "beforeend", this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

// ProjectList class
class ProjectList extends Component<HTMLDivElement, HTMLElement>{
    assignedProjects: Array<Project>;
    constructor(private type: "active" | "finished") {
        super("project-list", "app", false, `${type}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    private renderProjects() {
        const listEl = document.getElementById( `${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = "";
        for (const prjItem of this.assignedProjects) {
            const listItem = document.createElement("li");
            listItem.textContent = prjItem.title;
            listEl.appendChild(listItem);
        }
    }

    configure() {
        projectState.addListener((projects: Array<Project>) => {
            const relevantProjects = projects.filter(p => {
                if (this.type === "active") {
                    return p.status === ProjectStatus.ACTIVE
                }
                return p.status === ProjectStatus.FINISHED;
            });
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }
}

// ProjectInput class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = "user-input";

        this.titleInputElement = this.element.querySelector("#title")!;
        this.descriptionInputElement = this.element.querySelector("#description")!;
        this.peopleInputElement = this.element.querySelector("#people")!;

        this.configure();
        this.attach();
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        };
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ) {
            alert("Invalid input, please try again");
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople]
        }

    }

    private clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    @Autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();

        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }

    private configure() {
        this.element.addEventListener("submit", this.submitHandler)
    }

    private attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element)
    }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished")
