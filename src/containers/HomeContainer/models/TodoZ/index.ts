import {
  AddNewItemToCategoryList,
  addNewItemToTaskList,
  getTasksList,
  removeItemFromTaskList,
  updateItemOnTaskList,
} from '../../../../services/getTasksList';
import { ITodo } from '../../../../typings/index';

export default class TodoZ {
  private _todoS: { [p: string]: ITodo } = {};
  private _ids: string[] = [];
  private _categories: string[] = [];
  private _backupTodoS: ITodo[][] = [];

  set todoS(todoS: ITodo[]) {
    this._ids = [];
    this._todoS = {};
    todoS.map(item => {
      this._todoS[item.id] = item;
      this._ids.push(item.id);
    });
  }

  get todoS(): ITodo[] {
    return this._ids.map(ID => this._todoS[ID]);
  }

  set categories(categories: string[]) {
    this._categories = categories;
  }

  get categories(): string[] {
    return this._categories;
  }

  public async fetchTodoS(): Promise<void> {
    const { todoS, categories } = await getTasksList();
    console.log(todoS, categories);
    this.todoS = todoS;
    this._categories = categories;
  }

  public async add(todo: ITodo): Promise<void> {
    const backup: ITodo[] = this._ids.map(ID => this._todoS[ID]);
    if ((todo.task === '') || !todo) {
      throw new Error('empty task');
    } else if (todo.category === '') {
      throw new Error('no category');
    }
    const result = await addNewItemToTaskList(todo);
    this._ids.push(result.id);
    this._todoS[result.id] = result;
    this._backupTodoS.unshift(backup);
  }

  public async remove(id: string): Promise<void> {
    const backup: ITodo[] = this._ids.map(ID => this._todoS[ID]);
    const index = this._ids.indexOf(id);
    if (id === '' || index === -1) {
      throw new Error('no id or item not exits');
    }
    const result = await removeItemFromTaskList(id);
    this._ids.splice(index, 1);
    delete this._todoS[result];
    this._backupTodoS.unshift(backup);
  }

  public async update(todo: ITodo): Promise<void> {
    console.log(this._backupTodoS);
    const backup: ITodo[] = this._ids.map(ID => this._todoS[ID]);
    if ((todo.task === '') || !todo) {
      throw new Error('empty task');
    } else if (todo.category === '') {
      throw new Error('no category');
    } else if (todo.id === '') {
      throw new Error('item not exist');
    }
    const result = await updateItemOnTaskList(todo);
    this._todoS[result.id] = result;
    this._backupTodoS.unshift(backup);
    console.log(this._backupTodoS);
  }

  public async toggle(id: string): Promise<void> {
    if (!id) {
      throw new Error('invalid id');
    }
    const todo = {
      ...this._todoS[id],
      isActive: !this._todoS[id].isActive,
    };
    await this.update(todo);
  }

  public async addCategory(category: string): Promise<void> {
    if (!category) {
      throw new Error('invalid category');
    }
    const result = await AddNewItemToCategoryList(category);
    this._categories.push(result);
  }

  // todo need test
  public getTodoById(id: string): ITodo {
    return this._todoS[id];
  }

  public undo(): void {
    if (this._backupTodoS.length) {
      this._todoS = {};
      this._ids = [];
      this._backupTodoS[0].map(todo => {
        this._todoS[todo.id] = todo;
        this._ids.push(todo.id);
      });
      this._backupTodoS.splice(0, 1);
    }

  }
}
