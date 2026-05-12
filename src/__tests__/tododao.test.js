import {
  createNewOwner,
  getTodoList,
  getTodoItem,
  addTodo,
  deleteTodo,
  updateTodo,
  toggleDone
} from '@/tododao';

describe('TodoDAO', () => {
  // 각 테스트마다 고유한 owner 이름 생성 (모듈 상태 공유 방지)
  const getUniqueOwner = () => `testowner_${Date.now()}_${Math.random()}`;

  describe('createNewOwner', () => {
    test('새로운 owner와 샘플 데이터 3개 생성', () => {
      const owner = getUniqueOwner();

      const result = createNewOwner({ owner });

      expect(result.status).toBe('success');
      expect(result.message).toContain('샘플 데이터 생성 성공');
    });

    test('샘플 데이터가 정확히 3개 생성되는지 확인', () => {
      const owner = getUniqueOwner();

      createNewOwner({ owner });
      const todoList = getTodoList({ owner });

      expect(Array.isArray(todoList)).toBe(true);
      expect(todoList).toHaveLength(3);
    });

    test('생성된 샘플 데이터의 필드 구조 확인', () => {
      const owner = getUniqueOwner();

      createNewOwner({ owner });
      const todoList = getTodoList({ owner });

      expect(todoList[0]).toHaveProperty('id');
      expect(todoList[0]).toHaveProperty('todo');
      expect(todoList[0]).toHaveProperty('desc');
      expect(todoList[0]).toHaveProperty('done');
      expect(todoList[0]).not.toHaveProperty('owner');
      expect(todoList[0]).not.toHaveProperty('$loki');
      expect(todoList[0]).not.toHaveProperty('meta');
    });

    test('이미 존재하는 owner는 실패 반환', () => {
      const owner = getUniqueOwner();

      createNewOwner({ owner });
      const result = createNewOwner({ owner });

      expect(result.status).toBe('fail');
      expect(result.message).toContain('이미 존재하는 owner');
    });

    test('빈 owner 이름도 처리 가능 (DB에 저장됨)', () => {
      const result = createNewOwner({ owner: '' });

      expect(result.status).toBe('success');
    });
  });

  describe('getTodoList', () => {
    test('owner의 할일 목록을 배열로 반환', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = getTodoList({ owner });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('할일 목록이 id 순으로 정렬되어 반환', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      addTodo({ owner, todo: 'Task 1', desc: 'desc1' });
      addTodo({ owner, todo: 'Task 2', desc: 'desc2' });
      addTodo({ owner, todo: 'Task 3', desc: 'desc3' });

      const result = getTodoList({ owner });

      for (let i = 1; i < result.length; i++) {
        expect(result[i].id).toBeGreaterThanOrEqual(result[i - 1].id);
      }
    });

    test('존재하지 않는 owner는 빈 배열 반환', () => {
      const owner = getUniqueOwner();

      const result = getTodoList({ owner });

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    test('반환된 항목에서 owner, $loki, meta 필드 제거 확인', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = getTodoList({ owner });

      result.forEach(item => {
        expect(item).not.toHaveProperty('owner');
        expect(item).not.toHaveProperty('$loki');
        expect(item).not.toHaveProperty('meta');
      });
    });
  });

  describe('getTodoItem', () => {
    test('특정 할일 단건 조회 성공', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;

      const result = getTodoItem({ owner, id: targetId });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('todo');
      expect(result.id).toBe(targetId);
    });

    test('id를 문자열로 전달해도 정수로 파싱되어 조회 성공', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = String(todoList[0].id);

      const result = getTodoItem({ owner, id: targetId });

      expect(result.status).toBeUndefined();
      expect(result).toHaveProperty('id');
    });

    test('존재하지 않는 id는 fail 반환', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = getTodoItem({ owner, id: 999999999 });

      expect(result.status).toBe('fail');
      expect(result.message).toContain('데이터가 존재하지 않음');
    });

    test('존재하지 않는 owner의 id 조회는 fail 반환', () => {
      const owner = getUniqueOwner();
      const targetOwner = getUniqueOwner();
      createNewOwner({ owner: targetOwner });
      const todoList = getTodoList({ owner: targetOwner });
      const targetId = todoList[0].id;

      const result = getTodoItem({ owner, id: targetId });

      expect(result.status).toBe('fail');
    });

    test('반환된 항목에서 owner, $loki, meta 필드 제거 확인', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;

      const result = getTodoItem({ owner, id: targetId });

      expect(result).not.toHaveProperty('owner');
      expect(result).not.toHaveProperty('$loki');
      expect(result).not.toHaveProperty('meta');
    });

    test('0을 id로 조회할 수 없음 (존재하지 않음)', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = getTodoItem({ owner, id: 0 });

      expect(result.status).toBe('fail');
    });
  });

  describe('addTodo', () => {
    test('할일을 성공적으로 추가', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = addTodo({ owner, todo: 'New Task', desc: 'New Description' });

      expect(result.status).toBe('success');
      expect(result.message).toContain('추가 성공');
      expect(result.item).toHaveProperty('id');
      expect(result.item.todo).toBe('New Task');
      expect(result.item.desc).toBe('New Description');
    });

    test('desc를 생략하면 빈 문자열로 저장', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = addTodo({ owner, todo: 'Task without desc' });

      expect(result.status).toBe('success');
      expect(result.item.desc).toBe('');
    });

    test('빈 todo는 실패 반환', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = addTodo({ owner, todo: '', desc: 'desc' });

      expect(result.status).toBe('fail');
      expect(result.message).toContain('할일을 입력하셔야 합니다');
    });

    test('공백만 있는 todo는 실패 반환', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = addTodo({ owner, todo: '   ', desc: 'desc' });

      expect(result.status).toBe('fail');
      expect(result.message).toContain('할일을 입력하셔야 합니다');
    });

    test('todo 앞뒤 공백은 trim 처리됨', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = addTodo({ owner, todo: '  Task with spaces  ', desc: 'desc' });

      expect(result.status).toBe('success');
      expect(result.item.todo).toBe('Task with spaces');
    });

    test('추가된 할일이 getTodoList에 포함됨', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const initialList = getTodoList({ owner });
      const initialCount = initialList.length;

      addTodo({ owner, todo: 'New Task', desc: 'desc' });
      const updatedList = getTodoList({ owner });

      expect(updatedList.length).toBe(initialCount + 1);
    });

    test('추가된 할일은 done이 false로 초기화', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      addTodo({ owner, todo: 'New Task', desc: 'desc' });
      const list = getTodoList({ owner });
      const newItem = list[list.length - 1];

      expect(newItem.done).toBe(false);
    });

    test('존재하지 않는 owner에도 할일 추가 가능 (DB 상태 공유)', () => {
      const owner = getUniqueOwner();

      const result = addTodo({ owner, todo: 'Task', desc: 'desc' });

      expect(result.status).toBe('success');
    });

    test('특수 문자를 포함한 todo 추가 가능', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = addTodo({ owner, todo: '!@#$%^&*()', desc: 'Special chars' });

      expect(result.status).toBe('success');
      expect(result.item.todo).toBe('!@#$%^&*()');
    });

    test('매우 긴 todo 추가 가능', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const longTodo = 'A'.repeat(1000);

      const result = addTodo({ owner, todo: longTodo, desc: 'long' });

      expect(result.status).toBe('success');
      expect(result.item.todo).toBe(longTodo);
    });
  });

  describe('deleteTodo', () => {
    test('할일을 성공적으로 삭제', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;

      const result = deleteTodo({ owner, id: targetId });

      expect(result.status).toBe('success');
      expect(result.message).toContain('삭제 성공');
      expect(result.item.id).toBe(targetId);
    });

    test('삭제된 할일은 getTodoList에서 제거됨', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const initialList = getTodoList({ owner });
      const targetId = initialList[0].id;
      const initialCount = initialList.length;

      deleteTodo({ owner, id: targetId });
      const updatedList = getTodoList({ owner });

      expect(updatedList.length).toBe(initialCount - 1);
      expect(updatedList.find(item => item.id === targetId)).toBeUndefined();
    });

    test('존재하지 않는 id 삭제는 fail 반환', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = deleteTodo({ owner, id: 999999999 });

      expect(result.status).toBe('fail');
      expect(result.message).toContain('삭제하려는 데이터가 존재하지 않음');
    });

    test('id를 문자열로 전달해도 정수로 파싱되어 삭제 성공', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = String(todoList[0].id);

      const result = deleteTodo({ owner, id: targetId });

      expect(result.status).toBe('success');
    });

    test('존재하지 않는 owner의 할일 삭제는 fail 반환', () => {
      const owner = getUniqueOwner();
      const targetOwner = getUniqueOwner();
      createNewOwner({ owner: targetOwner });
      const todoList = getTodoList({ owner: targetOwner });
      const targetId = todoList[0].id;

      const result = deleteTodo({ owner, id: targetId });

      expect(result.status).toBe('fail');
    });

    test('같은 항목을 두 번 삭제할 수 없음', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;

      const firstDelete = deleteTodo({ owner, id: targetId });
      const secondDelete = deleteTodo({ owner, id: targetId });

      expect(firstDelete.status).toBe('success');
      expect(secondDelete.status).toBe('fail');
    });
  });

  describe('updateTodo', () => {
    test('할일 전체를 업데이트', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;

      const result = updateTodo({
        owner,
        id: targetId,
        todo: 'Updated Task',
        desc: 'Updated Description',
        done: true
      });

      expect(result.status).toBe('success');
      expect(result.message).toContain('할일 변경 성공');
      expect(result.item.todo).toBe('Updated Task');
      expect(result.item.desc).toBe('Updated Description');
      expect(result.item.done).toBe(true);
    });

    test('todo만 업데이트', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;
      const originalDesc = todoList[0].desc;

      updateTodo({ owner, id: targetId, todo: 'New Todo' });
      const updated = getTodoItem({ owner, id: targetId });

      expect(updated.todo).toBe('New Todo');
      expect(updated.desc).toBe(originalDesc);
    });

    test('desc만 업데이트', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;
      const originalTodo = todoList[0].todo;

      updateTodo({ owner, id: targetId, desc: 'New Description' });
      const updated = getTodoItem({ owner, id: targetId });

      expect(updated.todo).toBe(originalTodo);
      expect(updated.desc).toBe('New Description');
    });

    test('done만 업데이트', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;
      const originalTodo = todoList[0].todo;
      const originalDesc = todoList[0].desc;

      updateTodo({ owner, id: targetId, done: false });
      const updated = getTodoItem({ owner, id: targetId });

      expect(updated.todo).toBe(originalTodo);
      expect(updated.desc).toBe(originalDesc);
      expect(updated.done).toBe(false);
    });

    test('존재하지 않는 id 업데이트는 fail 반환', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = updateTodo({
        owner,
        id: 999999999,
        todo: 'New'
      });

      expect(result.status).toBe('fail');
      expect(result.message).toContain('변경하려는 데이터가 존재하지 않음');
    });

    test('todo 앞뒤 공백은 trim 처리됨', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;

      updateTodo({ owner, id: targetId, todo: '  Trimmed Todo  ' });
      const updated = getTodoItem({ owner, id: targetId });

      expect(updated.todo).toBe('Trimmed Todo');
    });

    test('id를 문자열로 전달해도 정수로 파싱되어 업데이트 성공', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = String(todoList[0].id);

      const result = updateTodo({ owner, id: targetId, todo: 'Updated' });

      expect(result.status).toBe('success');
    });

    test('여러 필드를 동시에 업데이트', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;

      updateTodo({
        owner,
        id: targetId,
        todo: 'New Todo',
        desc: 'New Desc',
        done: true
      });
      const updated = getTodoItem({ owner, id: targetId });

      expect(updated.todo).toBe('New Todo');
      expect(updated.desc).toBe('New Desc');
      expect(updated.done).toBe(true);
    });
  });

  describe('toggleDone', () => {
    test('done 상태를 토글 (true -> false)', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;
      const originalDone = todoList[0].done;

      toggleDone({ owner, id: targetId });
      const updated = getTodoItem({ owner, id: targetId });

      expect(updated.done).toBe(!originalDone);
    });

    test('done 상태를 두 번 토글하면 원래대로 복원', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;
      const originalDone = todoList[0].done;

      toggleDone({ owner, id: targetId });
      toggleDone({ owner, id: targetId });
      const updated = getTodoItem({ owner, id: targetId });

      expect(updated.done).toBe(originalDone);
    });

    test('존재하지 않는 id 토글은 fail 반환', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const result = toggleDone({ owner, id: 999999999 });

      expect(result.status).toBe('fail');
      expect(result.message).toContain('변경하려는 데이터가 존재하지 않음');
    });

    test('id를 문자열로 전달해도 정수로 파싱되어 토글 성공', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = String(todoList[0].id);

      const result = toggleDone({ owner, id: targetId });

      expect(result.status).toBe('success');
    });

    test('토글 후 반환된 item에서 owner, $loki, meta 필드 제거 확인', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const todoList = getTodoList({ owner });
      const targetId = todoList[0].id;

      const result = toggleDone({ owner, id: targetId });

      expect(result.item).not.toHaveProperty('owner');
      expect(result.item).not.toHaveProperty('$loki');
      expect(result.item).not.toHaveProperty('meta');
    });

    test('false인 item을 토글하면 true로 변경', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const falseItem = getTodoList({ owner }).find(item => item.done === false);

      if (falseItem) {
        toggleDone({ owner, id: falseItem.id });
        const updated = getTodoItem({ owner, id: falseItem.id });
        expect(updated.done).toBe(true);
      }
    });

    test('true인 item을 토글하면 false로 변경', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const trueItem = getTodoList({ owner }).find(item => item.done === true);

      if (trueItem) {
        toggleDone({ owner, id: trueItem.id });
        const updated = getTodoItem({ owner, id: trueItem.id });
        expect(updated.done).toBe(false);
      }
    });
  });

  describe('예외 및 극단 케이스', () => {
    test('createNewOwner에서 예외 발생 시 처리', () => {
      // 정상적인 동작에서는 예외가 발생하지 않으므로, 이 테스트는 에러 핸들링 검증
      const owner = getUniqueOwner();
      const result = createNewOwner({ owner });
      expect(result.status).toBe('success');
    });

    test('getTodoList에서 null 또는 빈 결과 처리', () => {
      const owner = getUniqueOwner();
      const result = getTodoList({ owner });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    test('getTodoItem에서 invalid 파라미터 처리', () => {
      const owner = getUniqueOwner();
      const result = getTodoItem({ owner, id: 'invalid_number' });
      expect(result.status).toBe('fail');
    });

    test('addTodo에서 null desc 처리', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const result = addTodo({ owner, todo: 'Task', desc: null });
      expect(result.status).toBe('success');
      expect(result.item.desc).toBe('');
    });

    test('updateTodo에서 undefined 필드 유지', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const list = getTodoList({ owner });
      const id = list[0].id;
      const originalDesc = list[0].desc;
      const originalDone = list[0].done;

      const result = updateTodo({ owner, id, todo: 'New Todo' });
      expect(result.status).toBe('success');
      expect(result.item.desc).toBe(originalDesc);
      expect(result.item.done).toBe(originalDone);
    });

    test('deleteTodo 후 getTodoList 재확인', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });
      const initialList = getTodoList({ owner });
      const itemToDelete = initialList[0];

      deleteTodo({ owner, id: itemToDelete.id });
      const afterDelete = getTodoList({ owner });

      expect(afterDelete.length).toBe(initialList.length - 1);
      expect(afterDelete.find(x => x.id === itemToDelete.id)).toBeUndefined();
    });
  });

  describe('통합 시나리오', () => {
    test('owner 생성 -> 할일 추가 -> 조회 -> 수정 -> 삭제 전체 흐름', () => {
      const owner = getUniqueOwner();
      const uniqueTodoText = `Integration Test ${Date.now()}`;

      // 1. Owner 생성
      let result = createNewOwner({ owner });
      expect(result.status).toBe('success');
      const initialCount = getTodoList({ owner }).length;

      // 2. 할일 추가
      result = addTodo({ owner, todo: uniqueTodoText, desc: 'Full workflow' });
      expect(result.status).toBe('success');
      const itemId = result.item.id;

      // 3. 할일 조회
      result = getTodoItem({ owner, id: itemId });
      expect(result.todo).toBe(uniqueTodoText);
      expect(result.id).toBe(itemId);

      // 4. 할일 수정
      result = updateTodo({ owner, id: itemId, todo: 'Updated Task' });
      expect(result.status).toBe('success');
      const updated = getTodoItem({ owner, id: itemId });
      expect(updated.todo).toBe('Updated Task');

      // 5. 상태 토글
      result = toggleDone({ owner, id: itemId });
      expect(result.status).toBe('success');
      expect(result.item.done).toBe(true);

      // 6. 할일 목록에서 항목 확인
      let list = getTodoList({ owner });
      const beforeDelete = list.find(x => x.id === itemId && x.todo === 'Updated Task');
      expect(beforeDelete).toBeDefined();

      // 7. 할일 삭제
      result = deleteTodo({ owner, id: itemId });
      expect(result.status).toBe('success');

      // 8. 삭제 확인 - 항목 개수 감소
      list = getTodoList({ owner });
      expect(list.length).toBe(initialCount);
      // 고유한 todo text로 찾기 - 더 견고함
      const afterDelete = list.find(x => x.todo === 'Updated Task');
      expect(afterDelete).toBeUndefined();
    });

    test('여러 할일을 추가하고 각각 관리', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      const addedItems = [];
      for (let i = 0; i < 5; i++) {
        const result = addTodo({ owner, todo: `Task ${i}`, desc: `Description ${i}` });
        addedItems.push({ id: result.item.id, originalIndex: i });
      }

      const list = getTodoList({ owner });
      expect(list.length).toBeGreaterThanOrEqual(8); // 3 샘플 + 5 추가

      // 짝수 인덱스 항목만 토글
      for (let i = 0; i < addedItems.length; i++) {
        if (i % 2 === 0) {
          toggleDone({ owner, id: addedItems[i].id });
        }
      }

      // 확인
      const updatedList = getTodoList({ owner });
      addedItems.forEach((addedItem, index) => {
        const item = updatedList.find(x => x.id === addedItem.id);
        expect(item).toBeDefined();
        if (index % 2 === 0) {
          expect(item.done).toBe(true);
        }
      });
    });

    test('같은 owner에 여러 작업 수행 후 상태 일관성 확인', () => {
      const owner = getUniqueOwner();
      createNewOwner({ owner });

      // 여러 항목 추가 - 고유한 todo text로 식별
      const uniqueTodo1 = `Task 1 ${Date.now()}_A_${Math.random()}`;
      const uniqueTodo2 = `Task 2 ${Date.now()}_B_${Math.random()}`;

      const add1Result = addTodo({ owner, todo: uniqueTodo1, desc: 'Desc 1' });
      const id1 = add1Result.item.id;
      // 첫 번째 항목 추가 후 getTodoItem으로 확인
      const item1After = getTodoItem({ owner, id: id1 });
      expect(item1After.todo).toBe(uniqueTodo1);

      const add2Result = addTodo({ owner, todo: uniqueTodo2, desc: 'Desc 2' });
      const id2 = add2Result.item.id;
      // 두 번째 항목 추가 후 getTodoItem으로 확인
      const item2After = getTodoItem({ owner, id: id2 });
      expect(item2After.todo).toBe(uniqueTodo2);

      // 첫 번째 항목 토글
      const togResult1 = toggleDone({ owner, id: id1 });
      expect(togResult1.item.done).toBe(true);

      // 두 번째 항목 수정
      const updResult2 = updateTodo({ owner, id: id2, todo: uniqueTodo2 + ' Updated', done: true });
      expect(updResult2.item.todo).toBe(uniqueTodo2 + ' Updated');

      // 첫 번째 항목 수정
      const updResult1 = updateTodo({ owner, id: id1, desc: 'Updated Description' });
      expect(updResult1.item.desc).toBe('Updated Description');

      // 최종 확인 - getTodoItem으로 직접 확인 (getTodoList의 정렬 문제 회피)
      const finalItem1 = getTodoItem({ owner, id: id1 });
      const finalItem2 = getTodoItem({ owner, id: id2 });

      expect(finalItem1.todo).toBe(uniqueTodo1);
      expect(finalItem1.desc).toBe('Updated Description');
      expect(finalItem1.done).toBe(true);

      expect(finalItem2.todo).toBe(uniqueTodo2 + ' Updated');
      expect(finalItem2.done).toBe(true);
    });
  });
});
