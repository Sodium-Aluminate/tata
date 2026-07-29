import './tata.css';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const genId = (() => {
  let timeStamp = 0;
  let count = 0;
  return function () {
    const time = Date.now();
    if (time > timeStamp) {
      timeStamp = time;
      count = 0;
    }
    count++;
    return `tata-${time}-count`;
  };
})();

function addIconsLink(href) {
  const iconLink = document.createElement('link');
  iconLink.rel = 'stylesheet';
  iconLink.href = href;
  document.head.appendChild(iconLink);
}

addIconsLink('https://fonts.googleapis.com/icon?family=Material+Icons');
const optionMaps = {
  position: {
    tr: 'top-right', tm: 'top-mid', tl: 'top-left',
    mr: 'mid-right', mm: 'mid-mid', ml: 'mid-left',
    br: 'bottom-right', bm: 'bottom-mid', bl: 'bottom-left'
  },
  type2Icon: {
    text: 'chat_bubble', log: 'textsms', info: 'forum',
    warn: 'info_outline', success: 'check', error: 'block',
    ask: 'help_outline',
  },
  slideDirection: {
    tr: 'right', mr: 'right', br: 'right',
    tl: 'left', ml: 'left', bl: 'left',
    tm: 'top', bm: 'bottom'
  }
};

function mapPosition(pos = 'tr') {
  return optionMaps.position[pos] || 'top-right';
}

function type2Icon(type = 'text') {
  return optionMaps.type2Icon[type] || '';
}

function mapAnimateIn(animate = 'fade', position = 'tr') {
  if (animate !== 'slide')
    return 'fade-in';
  const direction = optionMaps.slideDirection[position];
  if (!direction)
    return 'fade-in';
  return `slide-${direction}-in`;
}

function mapAnimateOut(animate = 'fade', position = 'tr') {
  if (animate !== 'slide')
    return 'fade-out';
  const direction = optionMaps.slideDirection[position];
  if (!direction)
    return 'fade-out';
  return `slide-${direction}-out`;
}

function clickTaTa(event) {
  const target = event.target;
  if (target.classList.contains('tata-close'))
    return;
  this.opts.onClick.call(this);
}

async function closeTaTa(event) {
  const target = event.target;
  if (!target.classList.contains('tata-close'))
    return;
  const element = target.parentNode;
  const ta = tataDatas.get(element);
  element.classList.add(mapAnimateOut(ta.opts.animate, ta.opts.position));
  const onClose = ta.opts.onClose;
  if (typeof onClose === 'function')
    onClose.call(ta);
  await scheduleRemoveTata(ta);
}

document.addEventListener('click', closeTaTa, false);
const tatas = {byPosition: {}, byId: {}};
const tataDatas = new WeakMap();

function recordTata(record) {
  const element = record.element;
  tatas.byPosition[record.opts.position] = record;
  tatas.byId[record.id] = record;
  tataDatas.set(element, record);
}

function removeTata(record) {
  if (tatas.byPosition[record.opts.position] === record)
    delete tatas.byPosition[record.opts.position];
  delete tatas.byId[record.id];
  record.element.remove();
}

async function scheduleRemoveTata(record) {
  await sleep(800);
  removeTata(record);
}

function htmlToElement(htmlStr) {
  const container = document.createElement('div');
  container.innerHTML = htmlStr;
  return container.firstElementChild;
}

async function render(title, text, opts) {
  const id = genId();
  const element = htmlToElement(`
      <div class="tata ${opts.type} ${mapAnimateIn(opts.animate, opts.position)} ${mapPosition(opts.position)}" id=${id}>
        <i class="tata-icon material-icons">${type2Icon(opts.type)}</i>
        <div class="tata-body">
          <h4 class="tata-title">${title}</h4>
          <p class="tata-text">${text}</p>
        </div>
        ${opts.closeBtn || opts.holding ?
    '<button class="tata-close material-icons">clear</button>' : ''}
        ${!opts.holding && opts.progress ?
    '<div class="tata-progress"></div>' : ''}
      </div>
    `);
  const samePosition = tatas.byPosition[opts.position];
  if (samePosition)
    scheduleRemoveTata(samePosition).then();
  const ta = {title, text, opts, id, element};
  recordTata(ta);
  document.body.insertAdjacentElement('beforeend', element);
  console.log(performance.now());
  if (typeof opts.onClick === 'function') {
    element.addEventListener('click', clickTaTa.bind(ta), {capture: true, once: true});
  }
  if (opts.holding)
    return;
  if (opts.progress) {
    const progress = element.querySelector('div.tata-progress');
    progress.style.animation = `${opts.duration / 1000}s reduceWidth linear forwards`;
  }
  await sleep(opts.duration);
  element.classList.add(mapAnimateOut(ta.opts.animate, ta.opts.position));
  console.log(performance.now());
  scheduleRemoveTata(ta).then();
  if (typeof ta.opts.onClose === 'function')
    ta.opts.onClose.call(ta);
}

const defaultOpts = {
  type: 'log',
  position: 'tr',
  animate: 'fade', // slide
  duration: 3000,
  progress: true,
  holding: false,
  closeBtn: true,
  onClick: null,
  onClose: null
};

export function text(title = '你好', text = '今天是' + new Date().toLocaleString(), opts = {}) {
  const _opts = Object.assign({}, defaultOpts, opts, {type: 'text'});
  render(title, text, _opts);
}

export function log(title = '你好', text = '今天是' + new Date().toLocaleString(), opts = {}) {
  const _opts = Object.assign({}, defaultOpts, opts, {type: 'log'});
  render(title, text, _opts);
}

export function info(title = '你好', text = '今天是' + new Date().toLocaleString(), opts = {}) {
  const _opts = Object.assign({}, defaultOpts, opts, {type: 'info'});
  render(title, text, _opts);
}

export function warn(title = '你好', text = '今天是' + new Date().toLocaleString(), opts = {}) {
  const _opts = Object.assign({}, defaultOpts, opts, {type: 'warn'});
  render(title, text, _opts);
}

export function error(title = '你好', text = '今天是' + new Date().toLocaleString(), opts = {}) {
  const _opts = Object.assign({}, defaultOpts, opts, {type: 'error'});
  render(title, text, _opts);
}

export function success(title = '你好', text = '今天是' + new Date().toLocaleString(), opts = {}) {
  const _opts = Object.assign({}, defaultOpts, opts, {type: 'success'});
  render(title, text, _opts);
}

export function ask() {
  throw "todo";
  // const _opts = Object.assign({}, defaultOpts, opts, {type: 'ask'})
  // render(title, text, _opts)
}

export function clear() {
  Object.values(tatas.byId).forEach(ta => scheduleRemoveTata(ta));
}

