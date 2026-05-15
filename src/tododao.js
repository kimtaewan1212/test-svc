import loki from "lokijs";

let todolist;
let id = new Date().getTime();
let idCounter = 0;

// let databaseInitialize= () => {
//     todolist = db.getCollection("todolist");
//     if (todolist === null) {
//         todolist = db.addCollection('todolist', { indices: ['owner','no'] });
//         //샘플 데이터
//         todolist.insert( { owner:'gdhong', no:123456789, todo:"ES6 공부", desc:"ES6공부를 해야 합니다", done:true });
//         todolist.insert( { owner:'gdhong', no:no++, todo:"Vue 학습", desc:"Vue 학습을 해야 합니다", done:false });
//         todolist.insert( { owner:'gdhong', no:no++, todo:"놀기", desc:"노는 것도 중요합니다.", done:true });
//         todolist.insert( { owner:'gdhong', no:no++, todo:"야구장", desc:"프로야구 경기도 봐야합니다.", done:false });

//         todolist.insert( { owner:'mrlee', no:no++, todo:"남원구경", desc:"고향집에 가봐야합니다.", done:true });
//         todolist.insert( { owner:'mrlee', no:no++, todo:"저녁약속(10.11)", desc:"지인과의 중요한 저녁 약속입니다.", done:false });
//         todolist.insert( { owner:'mrlee', no:no++, todo:"AWS 밋업", desc:"AWS 밋업에 반드시 참석해야 합니다.", done:false });
//         todolist.insert( { owner:'mrlee', no:no++, todo:"AAI 모임", desc:"공인강사들 모임이 있습니다.", done:true });
//     }
// }

// var db = new loki('sample.db', {
// 	autoload: true,
// 	autoloadCallback : databaseInitialize,
// 	autosave: true,
// 	autosaveInterval: 60000
// });

const cleanTodoItem = (item) => {
  const cleanItem = { ...item };
  delete cleanItem.meta;
  delete cleanItem["$loki"];
  delete cleanItem.owner; // owner는 서버 내부 파티셔닝 키로, 클라이언트 응답에 노출하지 않음
  return cleanItem;
};

const db = new loki();
todolist = db.getCollection("todolist");
if (todolist === null) {
  todolist = db.addCollection("todolist", { indices: ["owner", "id"] });
}
const initializeDatabase = () => {
  const sampleData = [
    { owner: "gdhong", id: 123456789, todo: "ES6 공부", desc: "ES6공부를 해야 합니다", done: true },
    { owner: "gdhong", id: ++id, todo: "Vue 학습", desc: "Vue 학습을 해야 합니다", done: false },
    { owner: "gdhong", id: ++id, todo: "놀기", desc: "노는 것도 중요합니다.", done: true },
    { owner: "gdhong", id: ++id, todo: "야구장", desc: "프로야구 경기도 봐야합니다.", done: false },
    { owner: "mrlee", id: ++id, todo: "남원구경", desc: "고향집에 가봐야합니다.", done: true },
    { owner: "mrlee", id: ++id, todo: "저녁약속(10.11)", desc: "지인과의 중요한 저녁 약속입니다.", done: false },
    { owner: "mrlee", id: ++id, todo: "AWS 밋업", desc: "AWS 밋업에 반드시 참석해야 합니다.", done: false },
    { owner: "mrlee", id: ++id, todo: "AAI 모임", desc: "공인강사들 모임이 있습니다.", done: true }
  ];
  
  sampleData.forEach(data => todolist.insert(data));
};

initializeDatabase();

export const createNewOwner = ({ owner }) => {
  console.log(`[DAO] createNewOwner owner=${owner}`);
  try {
    const queryResult = todolist.find({ owner });
    const localId = new Date().getTime();
    if (queryResult.length === 0) {
      todolist.insert({ owner, id: localId, todo: "ES6 공부", desc: "ES6공부를 해야 합니다", done: true });
      todolist.insert({ owner, id: localId + 1, todo: "Vue 학습", desc: "React 학습을 해야 합니다", done: false });
      todolist.insert({ owner, id: localId + 2, todo: "야구장", desc: "프로야구 경기도 봐야합니다.", done: false });
      console.log(`[DAO] createNewOwner 성공 owner=${owner}`);
      return { status: "success", message: "샘플 데이터 생성 성공!" };
    } else {
      console.log(`[DAO] createNewOwner 실패 - 이미 존재하는 owner=${owner}`);
      return { status: "fail", message: "생성 실패 : 이미 존재하는 owner입니다." };
    }
  } catch (ex) {
    console.error(`[DAO] createNewOwner 예외 owner=${owner}`, ex);
    return { status: "fail", message: "생성 실패 : " + ex };
  }
};

export const getTodoList = ({ owner }) => {
  console.log(`[DAO] getTodoList owner=${owner}`);
  try {
    const queryResult = todolist.chain().find({ owner }).simplesort("id").data();
    console.log(`[DAO] getTodoList 완료 owner=${owner} count=${queryResult.length}`);
    return queryResult.map(cleanTodoItem);
  } catch (ex) {
    console.error(`[DAO] getTodoList 예외 owner=${owner}`, ex);
    return { status: "fail", message: "조회 실패 : " + ex };
  }
};

export const getTodoItem = ({ owner, id }) => {
  console.log(`[DAO] getTodoItem owner=${owner} id=${id}`);
  try {
    const parsedId = parseInt(id, 10); // URL 파라미터는 문자열이므로 LokiJS 타입 엄격 매칭을 위해 변환
    const one = todolist.findOne({ owner, id: parsedId });

    if (!one) {
      console.log(`[DAO] getTodoItem 실패 - 데이터 없음 owner=${owner} id=${id}`);
      return { status: "fail", message: "조회 실패 : 데이터가 존재하지 않음" };
    }

    console.log(`[DAO] getTodoItem 완료 owner=${owner} id=${id}`);
    return cleanTodoItem(one);
  } catch (ex) {
    console.error(`[DAO] getTodoItem 예외 owner=${owner} id=${id}`, ex);
    return { status: "fail", message: "조회 실패 : " + ex };
  }
};

export const addTodo = ({ owner, todo, desc }) => {
  console.log(`[DAO] addTodo owner=${owner} todo="${todo}"`);
  try {
    if (!todo || todo.trim() === "") {
      throw new Error("할일을 입력하셔야 합니다.");
    }

    const item = {
      owner,
      id: new Date().getTime() + (++idCounter), // 동일 밀리초 내 연속 삽입 시 id 충돌 방지
      todo: todo.trim(),
      desc: desc || "",
      done: false
    };

    todolist.insert(item);
    console.log(`[DAO] addTodo 완료 owner=${owner} id=${item.id}`);
    return {
      status: "success",
      message: "추가 성공",
      item: { id: item.id, todo: item.todo, desc: item.desc }
    };
  } catch (ex) {
    console.error(`[DAO] addTodo 예외 owner=${owner}`, ex);
    return { status: "fail", message: "추가 실패 : " + ex };
  }
};

export const deleteTodo = ({ owner, id }) => {
  console.log(`[DAO] deleteTodo owner=${owner} id=${id}`);
  try {
    const parsedId = parseInt(id, 10); // URL 파라미터는 문자열이므로 LokiJS 타입 엄격 매칭을 위해 변환
    const one = todolist.findOne({ owner, id: parsedId });

    if (!one) {
      console.log(`[DAO] deleteTodo 실패 - 데이터 없음 owner=${owner} id=${id}`);
      return { status: "fail", message: "삭제 실패 : 삭제하려는 데이터가 존재하지 않음" };
    }

    todolist.remove(one);
    console.log(`[DAO] deleteTodo 완료 owner=${owner} id=${id}`);
    return {
      status: "success",
      message: "삭제 성공",
      item: { id: one.id, todo: one.todo }
    };
  } catch (ex) {
    console.error(`[DAO] deleteTodo 예외 owner=${owner} id=${id}`, ex);
    return { status: "fail", message: "삭제 실패 : " + ex };
  }
};

export const updateTodo = ({ owner, id, todo, desc, done }) => {
  console.log(`[DAO] updateTodo owner=${owner} id=${id}`);
  try {
    const parsedId = parseInt(id, 10); // URL 파라미터는 문자열이므로 LokiJS 타입 엄격 매칭을 위해 변환
    const one = todolist.findOne({ owner, id: parsedId });

    if (!one) {
      console.log(`[DAO] updateTodo 실패 - 데이터 없음 owner=${owner} id=${id}`);
      return { status: "fail", message: "할일 변경 실패 : 변경하려는 데이터가 존재하지 않음" };
    }

    if (todo !== undefined) one.todo = todo.trim();
    if (desc !== undefined) one.desc = desc;
    if (done !== undefined) one.done = done;

    todolist.update(one);
    console.log(`[DAO] updateTodo 완료 owner=${owner} id=${id}`);
    return {
      status: "success",
      message: "할일 변경 성공",
      item: { id: one.id, todo: one.todo, desc: one.desc, done: one.done }
    };
  } catch (ex) {
    console.error(`[DAO] updateTodo 예외 owner=${owner} id=${id}`, ex);
    return { status: "fail", message: "할일 변경 실패 : " + ex };
  }
};

export const toggleDone = ({ owner, id }) => {
  console.log(`[DAO] toggleDone owner=${owner} id=${id}`);
  try {
    const parsedId = parseInt(id, 10); // URL 파라미터는 문자열이므로 LokiJS 타입 엄격 매칭을 위해 변환
    const one = todolist.findOne({ owner, id: parsedId });

    if (!one) {
      console.log(`[DAO] toggleDone 실패 - 데이터 없음 owner=${owner} id=${id}`);
      return { status: "fail", message: "완료 변경 실패 : 변경하려는 데이터가 존재하지 않음" };
    }

    one.done = !one.done;
    todolist.update(one);
    console.log(`[DAO] toggleDone 완료 owner=${owner} id=${id} done=${one.done}`);
    return {
      status: "success",
      message: "완료 변경 성공",
      item: { id: one.id, todo: one.todo, done: one.done }
    };
  } catch (ex) {
    console.error(`[DAO] toggleDone 예외 owner=${owner} id=${id}`, ex);
    return { status: "fail", message: "완료 변경 실패 : " + ex };
  }
};
