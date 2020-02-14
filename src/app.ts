function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    enumerable: false,
    configurable: true,
    get() {
      return originalMethod.bind(this);
    }
  }
  return adjustedDescriptor;
}

class Validation {
  private constructor() {}

  static isNotEmpty(val: string) {
    return val.trim().length > 0
  }

  static maxLength(val: string, length: number) {
    return val.trim().length < length
  }

  static minLength(val: string, length: number) {
    return val.trim().length > length
  }

  static lengthStrict(val: string, min: number, max: number) {
    if (min > max) {
      throw new Error('Min cannot be greater than max!!')
    }
    return val.trim().length > min && val.trim().length < max
  }
}

class Project {
  public id: string;
  constructor(
    public type: 'finished' | 'active',
    public title: string,
    public description: string,
    public people: number
  ) {
    this.id = Date.now().toString();
  }
}

class State {
  static instance: State;
  
  static init() {
    if (!this.instance) {
      this.instance = new State()
    }
    return this.instance;
  }

  private projectList: Project[] = [];
  listenEvents: Function[] = [];

  private constructor() {}

  addProject(prj: Project) {
    this.projectList.push(prj);
  }

  get projects(){
    return [...this.projectList]
  }
}

const appState = State.init();

// Project List
class ProjectListComponent {
  projectElement: HTMLElement;
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  singleTempProject: HTMLTemplateElement;

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.singleTempProject = document.getElementById('single-project') as HTMLTemplateElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.projectElement = importedNode.firstElementChild as HTMLElement;
    this.projectElement.id = this.type;

    this.attach();
    this.configure();
  }

  private configure() {
    this.projectElement.querySelector('h2')!.textContent = `${this.type}-projects`.toUpperCase();
    this.projectElement.id = `${this.type}-projects`;
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.projectElement);
  }

  public renderList() {
    const projectList = appState.projects;
    projectList.forEach(prj => {

    })
  }
}

// InputProject Class
class FormComponent {
  public projectInputElement: HTMLTemplateElement;
  public hostElement: HTMLDivElement;
  public formElement: HTMLInputElement;
  public titleInputElement: HTMLInputElement;
  public descInputElement: HTMLInputElement;
  public peopleInputElement: HTMLInputElement;

  constructor() {
    this.projectInputElement = document.getElementById('project-input') as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.projectInputElement.content, true);
    this.formElement = importedNode.firstElementChild as HTMLInputElement;
    this.formElement.id = 'user-input';
    
    this.titleInputElement = this.formElement.querySelector('#title') as HTMLInputElement;
    this.descInputElement = this.formElement.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.formElement.querySelector('#people') as HTMLInputElement;
    
    this._attach(this.formElement);
    this._eventBinding();
  }

  private _gatherInput(): [string, string, number] {
    const titleValue = this.titleInputElement.value;
    const descValue = this.descInputElement.value;
    const peopleValue = this.peopleInputElement.value;

    const condition1 = Validation.isNotEmpty(titleValue) || Validation.isNotEmpty(descValue) || Validation.isNotEmpty(peopleValue);
    const condition2 = Validation.lengthStrict(titleValue, 5, 30)
    const condition3 = Validation.minLength(descValue, 8);

    if (!condition1) {
      alert('All fields should not be empty')
    } else if (!condition2) {
      alert('Title should be less than 30 characters or more than 5 characters')
    } else if (!condition3) {
      alert('Desc should be more than 8')
    } else {
      this._clear();
      return [titleValue, descValue, +peopleValue];
    }
    return [titleValue, descValue, +peopleValue];
  }

  private _clear() {
    this.titleInputElement.value = '';
    this.descInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @Autobind
  private _onSubmit(event: Event) {
    event.preventDefault();
    const [title, desc, numberOfPeople] = this._gatherInput();
    const project = new Project('active', title, desc, numberOfPeople);
    appState.addProject(project);
  }

  private _eventBinding() {
    this.formElement.addEventListener('submit', this._onSubmit)
  }

  private _attach(importedElement: HTMLElement) {
    this.hostElement.insertAdjacentElement('afterbegin', importedElement)
  }
}

const fc = new FormComponent()
const prjActive = new ProjectListComponent('active');
const prjFinished = new ProjectListComponent('finished');