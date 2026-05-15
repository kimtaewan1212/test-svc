import {
  addTodo,
  deleteTodo,
  updateTodo,
  toggleDone,
  getTodoItem,
  getTodoList,
  createNewOwner
} from "./tododao.js";
import sleep from "sleep-promise";

const createAsyncHandler = (handler, delay = 0) => {
  return delay > 0
    ? (req, res) => sleep(delay).then(() => handler(req, res))
    : handler;
};

const logRequest = (method, path, params = {}) => {
  const paramStr = Object.keys(params).length ? ` ${JSON.stringify(params)}` : '';
  console.log(`### ${method} ${path}${paramStr}`);
};

export default (app) => {
  app.get("/", (req, res) => {
    logRequest('GET', '/');
    res.render("index", {
      title: "todolist 서비스 v1.0",
      subtitle: "(node.js + express + lokijs)",
    });
  });

  const getUserHandler = (req, res) => {
    const { id } = req.params;
    logRequest('GET', '/users/:id', { id });
    res.json({ id, userid: "gdhong", username: "홍길동" });
  };

  // 클라이언트 타임아웃 시나리오 테스트를 위한 인위적 3초 지연
  app.get("/users/:id", createAsyncHandler(getUserHandler, 3000));

  app.get("/todolist/:owner/create", (req, res) => {
    const { owner } = req.params;
    logRequest('GET', '/todolist/:owner/create', { owner });
    const result = createNewOwner({ owner });
    console.log(`[createNewOwner] owner=${owner} result=${result.status}`);
    res.json(result);
  });

  const getTodoListHandler = (req, res) => {
    const { owner } = req.params;
    logRequest('GET', '/todolist/:owner', { owner });
    const todolist = getTodoList({ owner });
    console.log(`[getTodoList] owner=${owner} count=${Array.isArray(todolist) ? todolist.length : 'fail'}`);
    res.json(todolist);
  };

  app.get("/todolist/:owner", (req, res) => {
    getTodoListHandler(req, res);
  });

  // _long 라우트는 네트워크 지연 시뮬레이션용 1초 지연 버전
  app.get("/todolist_long/:owner", (req, res) => {
    createAsyncHandler(getTodoListHandler, 1000)(req, res);
  });

  const getTodoItemHandler = (req, res) => {
    const { owner, id } = req.params;
    logRequest('GET', '/todolist/:owner/:id', { owner, id });
    const todoitem = getTodoItem({ owner, id });
    console.log(`[getTodoItem] owner=${owner} id=${id} result=${todoitem.status ?? 'ok'}`);
    res.json(todoitem);
  };

  app.get("/todolist/:owner/:id", (req, res) => {
    getTodoItemHandler(req, res);
  });

  app.get("/todolist_long/:owner/:id", (req, res) => {
    createAsyncHandler(getTodoItemHandler, 1000)(req, res);
  });

  const addTodoHandler = (req, res) => {
    const { owner } = req.params;
    const { todo, desc } = req.body;
    logRequest('POST', '/todolist/:owner', { owner, todo });
    const result = addTodo({ owner, todo, desc });
    console.log(`[addTodo] owner=${owner} result=${result.status}`);
    res.json(result);
  };

  app.post("/todolist/:owner", (req, res) => {
    addTodoHandler(req, res);
  });

  app.post("/todolist_long/:owner", (req, res) => {
    createAsyncHandler(addTodoHandler, 1000)(req, res);
  });

  const updateTodoHandler = (req, res) => {
    const { owner, id } = req.params;
    const { todo, done, desc } = req.body;
    logRequest('PUT', '/todolist/:owner/:id', { owner, id });
    const result = updateTodo({ owner, id, todo, done, desc });
    console.log(`[updateTodo] owner=${owner} id=${id} result=${result.status}`);
    res.json(result);
  };

  app.put("/todolist/:owner/:id", (req, res) => {
    updateTodoHandler(req, res);
  });

  app.put("/todolist_long/:owner/:id", (req, res) => {
    createAsyncHandler(updateTodoHandler, 1000)(req, res);
  });

  const toggleDoneHandler = (req, res) => {
    const { owner, id } = req.params;
    logRequest('PUT', '/todolist/:owner/:id/done', { owner, id });
    const result = toggleDone({ owner, id });
    console.log(`[toggleDone] owner=${owner} id=${id} result=${result.status}`);
    res.json(result);
  };

  app.put("/todolist/:owner/:id/done", (req, res) => {
    toggleDoneHandler(req, res);
  });

  app.put("/todolist_long/:owner/:id/done", (req, res) => {
    createAsyncHandler(toggleDoneHandler, 1000)(req, res);
  });

  const deleteTodoHandler = (req, res) => {
    const { owner, id } = req.params;
    logRequest('DELETE', '/todolist/:owner/:id', { owner, id });
    const result = deleteTodo({ owner, id });
    console.log(`[deleteTodo] owner=${owner} id=${id} result=${result.status}`);
    res.json(result);
  };

  app.delete("/todolist/:owner/:id", (req, res) => {
    deleteTodoHandler(req, res);
  });

  app.delete("/todolist_long/:owner/:id", (req, res) => {
    createAsyncHandler(deleteTodoHandler, 1000)(req, res);
  });

  app.use((err, req, res, next) => {
    console.log("### ERROR!!");

    const errorResponses = {
      404: { status: 404, message: "잘못된 URI 요청" },
      500: { status: 500, message: "내부 서버 오류" }
    };

    const response = errorResponses[err.status] ||
      { status: "fail", message: err.message };

    res.status(err.status || 500).json(response);
  });
};
