import Router from 'koa-router';
import songStore from './store';
import { broadcast } from "../utils";

export const router = new Router();

router.get('/', async (ctx) => {
  const response = ctx.response;
  const userId = ctx.state.user._id;
  response.body = await songStore.find({ userId });
  // console.log(response.body)
  response.status = 200; // ok
});

router.get('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const song = await songStore.findOne({ _id: ctx.params.id });
  const response = ctx.response;
  if (song) {
    if (song.userId === userId) {
      response.body = song;
      response.status = 200; // ok
    } else {
      response.status = 403; // forbidden
    }
  } else {
    response.status = 404; // not found
  }
});

const createNote = async (ctx, song, response) => {
  try {
    console.log(song)
    const userId = ctx.state.user._id;
    if (song._id != null){
      delete song._id
    }
    song.userId = userId;
    response.body = await songStore.insert(song);
    response.status = 201; // created
    broadcast(userId, { type: 'created', payload: response.body });
  } catch (err) {
    response.body = { message: err.message };
    response.status = 400; // bad request
    console.log(response.body)
  }
};

router.post('/', async ctx => await createNote(ctx, ctx.request.body, ctx.response));

router.put('/:id', async (ctx) => {
  const song = ctx.request.body;
  const id = ctx.params.id;
  const songId = song._id;
  const response = ctx.response;
  if (songId && songId !== id) {
    response.body = { message: 'Param id and body _id should be the same' };
    response.status = 400; // bad request
    return;
  }
  if (!songId) {
    await createNote(ctx, song, response);
  } else {
    const userId = ctx.state.user._id;
    song.userId = userId;
    const updatedCount = await songStore.update({ _id: id }, song);
    if (updatedCount === 1) {
      response.body = song;
      response.status = 200; // ok
      broadcast(userId, { type: 'updated', payload: song });
    } else {
      response.body = { message: 'Resource no longer exists' };
      response.status = 405; // method not allowed
    }
  }
});

router.del('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const song = await songStore.findOne({ _id: ctx.params.id });
  if (song && userId !== song.userId) {
    ctx.response.status = 403; // forbidden
  } else {
    await songStore.remove({ _id: ctx.params.id });
    ctx.response.status = 204; // no content
  }
});
