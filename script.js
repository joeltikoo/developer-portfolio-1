const menuTime = document.getElementById('menuTime');
const menuDate = document.getElementById('menuDate');
const desktop = document.getElementById('desktop');
const windowLayer = document.getElementById('windowLayer');
const tileToggle = document.getElementById('tileToggle');
const windows = Array.from(document.querySelectorAll('.app-window'));
const taskbarApps = Array.from(document.querySelectorAll('.taskbar-app'));
const desktopIcons = Array.from(document.querySelectorAll('.desktop-icon'));
const launchers = Array.from(document.querySelectorAll('.launcher'));
const startItems = Array.from(document.querySelectorAll('.start-item'));
const startButton = document.getElementById('startButton');
const startMenu = document.getElementById('startMenu');

const defaultLayouts = {
  hero: { left: 130, top: 16, width: 860, height: 470 },
  about: { left: 520, top: 52, width: 760, height: 380 },
  projects: { left: 150, top: 260, width: 940, height: 440 },
  skills: { left: 690, top: 360, width: 620, height: 300 },
  contact: { left: 200, top: 100, width: 620, height: 290 }
};

let highestZ = 20;
let tilingMode = false;
let dragState = null;
let deviceMode = 'desktop';

function updateClock() {
  const now = new Date();
  menuTime.textContent = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  menuDate.textContent = now.toLocaleDateString([], {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

function setTaskbarRunning(windowId, isRunning) {
  taskbarApps.forEach((item) => {
    if (item.dataset.open === windowId) {
      item.classList.toggle('running', isRunning);
    }
  });
}

function getVisibleWindows() {
  return windows.filter(
    (windowEl) => !windowEl.classList.contains('hidden') && !windowEl.classList.contains('minimized')
  );
}

function setActiveWindow(targetWindow) {
  windows.forEach((windowEl) => windowEl.classList.remove('active'));
  highestZ += 1;
  targetWindow.style.zIndex = highestZ;
  targetWindow.classList.add('active');
}

function readWindowBounds(windowEl) {
  return {
    left: parseFloat(windowEl.style.left || '0'),
    top: parseFloat(windowEl.style.top || '0'),
    width: parseFloat(windowEl.style.width || `${windowEl.offsetWidth}`),
    height: parseFloat(windowEl.style.height || `${windowEl.offsetHeight}`)
  };
}

function setWindowBounds(windowEl, bounds) {
  windowEl.style.left = `${bounds.left}px`;
  windowEl.style.top = `${bounds.top}px`;
  windowEl.style.width = `${bounds.width}px`;
  windowEl.style.height = `${bounds.height}px`;
}

function applyDefaultWindowLayout(windowId) {
  const targetWindow = document.getElementById(windowId);
  const config = defaultLayouts[windowId];

  if (!targetWindow || !config) {
    return;
  }

  targetWindow.classList.remove('maximized');
  delete targetWindow.dataset.prevBounds;
  setWindowBounds(targetWindow, config);
}

function maximizeWindow(windowEl) {
  if (deviceMode !== 'desktop') {
    return;
  }

  if (tilingMode) {
    toggleTiling(false);
  }

  const gap = 8;
  const layerBounds = windowLayer.getBoundingClientRect();
  const isMaximized = windowEl.classList.contains('maximized');

  if (isMaximized) {
    const prevBounds = windowEl.dataset.prevBounds ? JSON.parse(windowEl.dataset.prevBounds) : defaultLayouts[windowEl.id];
    windowEl.classList.remove('maximized');
    if (prevBounds) {
      setWindowBounds(windowEl, prevBounds);
    }
    return;
  }

  windowEl.dataset.prevBounds = JSON.stringify(readWindowBounds(windowEl));
  windowEl.classList.add('maximized');
  setWindowBounds(windowEl, {
    left: gap,
    top: gap,
    width: Math.max(layerBounds.width - gap * 2, 300),
    height: Math.max(layerBounds.height - gap * 2, 220)
  });
}

function applyTiledLayout() {
  const activeWindows = getVisibleWindows();
  const bounds = windowLayer.getBoundingClientRect();

  if (!tilingMode || activeWindows.length === 0 || deviceMode !== 'desktop') {
    return;
  }

  const gap = 10;
  const count = activeWindows.length;
  const wideScreen = bounds.width >= bounds.height * 1.2;
  const placeWindow = (windowEl, left, top, width, height) => {
    windowEl.style.left = `${left}px`;
    windowEl.style.top = `${top}px`;
    windowEl.style.width = `${width}px`;
    windowEl.style.height = `${height}px`;
  };

  if (count === 1) {
    const windowEl = activeWindows[0];
    placeWindow(windowEl, gap, gap, bounds.width - gap * 2, bounds.height - gap * 2);
    return;
  }

  if (count === 2) {
    const first = activeWindows[0];
    const second = activeWindows[1];

    if (wideScreen) {
      const colWidth = (bounds.width - gap * 3) / 2;
      [first, second].forEach((windowEl, index) => {
        placeWindow(windowEl, gap + index * (colWidth + gap), gap, colWidth, bounds.height - gap * 2);
      });
    } else {
      const rowHeight = (bounds.height - gap * 3) / 2;
      [first, second].forEach((windowEl, index) => {
        placeWindow(windowEl, gap, gap + index * (rowHeight + gap), bounds.width - gap * 2, rowHeight);
      });
    }
    return;
  }

  if (count === 3) {
    const master = activeWindows[0];
    const stackOne = activeWindows[1];
    const stackTwo = activeWindows[2];

    if (wideScreen) {
      const masterWidth = Math.floor((bounds.width - gap * 3) * 0.58);
      const stackWidth = bounds.width - masterWidth - gap * 3;
      const stackHeight = (bounds.height - gap * 3) / 2;

      placeWindow(master, gap, gap, masterWidth, bounds.height - gap * 2);

      [stackOne, stackTwo].forEach((windowEl, index) => {
        placeWindow(windowEl, masterWidth + gap * 2, gap + index * (stackHeight + gap), stackWidth, stackHeight);
      });
    } else {
      const masterHeight = Math.floor((bounds.height - gap * 3) * 0.56);
      const stackHeight = bounds.height - masterHeight - gap * 3;
      const stackWidth = (bounds.width - gap * 3) / 2;

      placeWindow(master, gap, gap, bounds.width - gap * 2, masterHeight);

      [stackOne, stackTwo].forEach((windowEl, index) => {
        placeWindow(windowEl, gap + index * (stackWidth + gap), masterHeight + gap * 2, stackWidth, stackHeight);
      });
    }
    return;
  }

  if (count === 4) {
    const cellWidth = (bounds.width - gap * 3) / 2;
    const cellHeight = (bounds.height - gap * 3) / 2;

    activeWindows.forEach((windowEl, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      placeWindow(windowEl, gap + col * (cellWidth + gap), gap + row * (cellHeight + gap), cellWidth, cellHeight);
    });
    return;
  }

  if (count === 5) {
    const master = activeWindows[0];
    const stack = activeWindows.slice(1);

    if (wideScreen) {
      const masterWidth = Math.floor((bounds.width - gap * 3) * 0.42);
      const rightWidth = bounds.width - masterWidth - gap * 3;
      const cellWidth = (rightWidth - gap) / 2;
      const cellHeight = (bounds.height - gap * 3) / 2;

      placeWindow(master, gap, gap, masterWidth, bounds.height - gap * 2);

      stack.forEach((windowEl, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        placeWindow(
          windowEl,
          masterWidth + gap * 2 + col * (cellWidth + gap),
          gap + row * (cellHeight + gap),
          cellWidth,
          cellHeight
        );
      });
    } else {
      const masterHeight = Math.floor((bounds.height - gap * 3) * 0.42);
      const bottomHeight = bounds.height - masterHeight - gap * 3;
      const cellWidth = (bounds.width - gap * 3) / 2;
      const cellHeight = (bottomHeight - gap) / 2;

      placeWindow(master, gap, gap, bounds.width - gap * 2, masterHeight);

      stack.forEach((windowEl, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        placeWindow(
          windowEl,
          gap + col * (cellWidth + gap),
          masterHeight + gap * 2 + row * (cellHeight + gap),
          cellWidth,
          cellHeight
        );
      });
    }
    return;
  }

  const ratio = bounds.width / Math.max(bounds.height, 1);
  const cols = Math.max(2, Math.min(count, Math.round(Math.sqrt(count * ratio))));
  const rows = Math.ceil(count / cols);
  const rowHeight = (bounds.height - gap * (rows + 1)) / rows;

  for (let row = 0; row < rows; row += 1) {
    const rowStart = row * cols;
    const rowItems = activeWindows.slice(rowStart, rowStart + cols);
    const rowCols = rowItems.length;
    const rowCellWidth = (bounds.width - gap * (rowCols + 1)) / rowCols;

    rowItems.forEach((windowEl, col) => {
      placeWindow(windowEl, gap + col * (rowCellWidth + gap), gap + row * (rowHeight + gap), rowCellWidth, rowHeight);
    });
  }
}

function toggleTiling(forceValue) {
  const requested = typeof forceValue === 'boolean' ? forceValue : !tilingMode;
  if (requested && deviceMode !== 'desktop') {
    return;
  }

  tilingMode = requested;
  desktop.classList.toggle('tiling-on', tilingMode);
  tileToggle.classList.toggle('active', tilingMode);
  tileToggle.innerHTML = tilingMode
    ? '<svg class="mini-icon"><use href="#icon-tiles"></use></svg>Tiling On'
    : '<svg class="mini-icon"><use href="#icon-tiles"></use></svg>Tiling Off';

  if (!tilingMode) {
    getVisibleWindows().forEach((windowEl) => applyDefaultWindowLayout(windowEl.id));
  }

  applyTiledLayout();
}

function updateHomeVisibility() {
  const hasOpenWindow = getVisibleWindows().length > 0;
  const compact = deviceMode !== 'desktop';
  desktop.classList.toggle('has-open-window', compact && hasOpenWindow);
}

function openWindow(windowId) {
  const targetWindow = document.getElementById(windowId);

  if (!targetWindow) {
    return;
  }

  targetWindow.classList.remove('hidden');
  targetWindow.classList.remove('minimized');

  if (!tilingMode && deviceMode === 'desktop' && !targetWindow.classList.contains('maximized')) {
    applyDefaultWindowLayout(windowId);
  }

  setActiveWindow(targetWindow);
  setTaskbarRunning(windowId, true);

  if (tilingMode) {
    applyTiledLayout();
  }

  updateHomeVisibility();
}

function closeWindow(windowEl) {
  windowEl.classList.add('hidden');
  windowEl.classList.remove('active');
  windowEl.classList.remove('maximized');
  delete windowEl.dataset.prevBounds;
  setTaskbarRunning(windowEl.id, false);

  if (tilingMode) {
    applyTiledLayout();
  }

  updateHomeVisibility();
}

function minimizeWindow(windowEl) {
  windowEl.classList.add('minimized');
  windowEl.classList.remove('active');

  if (tilingMode) {
    applyTiledLayout();
  }

  updateHomeVisibility();
}

function closeAllWindows() {
  windows.forEach((windowEl) => {
    windowEl.classList.add('hidden');
    windowEl.classList.remove('minimized');
    windowEl.classList.remove('active');
    setTaskbarRunning(windowEl.id, false);
  });
  updateHomeVisibility();
}

function detectDeviceMode() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = width / Math.max(height, 1);

  if (width <= 820 || ratio < 0.82) {
    return 'mobile';
  }

  if (width <= 1200 || ratio < 1.35) {
    return 'tablet';
  }

  return 'desktop';
}

function updateDeviceMode() {
  const nextMode = detectDeviceMode();
  const changed = nextMode !== deviceMode;
  deviceMode = nextMode;

  document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
  document.body.classList.add(`device-${deviceMode}`);

  const compact = deviceMode !== 'desktop';
  tileToggle.disabled = compact;

  if (compact) {
    toggleTiling(false);
    startMenu.classList.add('hidden');
  } else if (changed && getVisibleWindows().length === 0) {
    openWindow('hero');
  }

  if (!tilingMode && deviceMode === 'desktop') {
    getVisibleWindows().forEach((windowEl) => applyDefaultWindowLayout(windowEl.id));
  }

  updateHomeVisibility();
}

function startDragging(event, windowEl) {
  if (tilingMode || deviceMode !== 'desktop' || windowEl.classList.contains('maximized')) {
    return;
  }

  const titlebar = event.currentTarget;
  if (event.target.closest('.window-controls')) {
    return;
  }

  const rect = windowEl.getBoundingClientRect();
  const layerRect = windowLayer.getBoundingClientRect();

  dragState = {
    windowEl,
    titlebar,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    layerRect
  };

  titlebar.classList.add('dragging');
  setActiveWindow(windowEl);
  titlebar.setPointerCapture(event.pointerId);
}

function onDrag(event) {
  if (!dragState) {
    return;
  }

  const { windowEl, offsetX, offsetY, layerRect } = dragState;
  const width = windowEl.offsetWidth;
  const height = windowEl.offsetHeight;

  const nextLeft = Math.min(
    Math.max(event.clientX - layerRect.left - offsetX, 0),
    Math.max(layerRect.width - width, 0)
  );
  const nextTop = Math.min(
    Math.max(event.clientY - layerRect.top - offsetY, 0),
    Math.max(layerRect.height - height, 0)
  );

  windowEl.style.left = `${nextLeft}px`;
  windowEl.style.top = `${nextTop}px`;
}

function stopDragging(event) {
  if (!dragState) {
    return;
  }

  const { titlebar } = dragState;
  titlebar.classList.remove('dragging');

  if (titlebar.hasPointerCapture(event.pointerId)) {
    titlebar.releasePointerCapture(event.pointerId);
  }

  dragState = null;
}

function bindWindowEvents(windowEl) {
  windowEl.addEventListener('mousedown', () => {
    if (!windowEl.classList.contains('hidden') && !windowEl.classList.contains('minimized')) {
      setActiveWindow(windowEl);
    }
  });

  const titlebar = windowEl.querySelector('.window-titlebar');
  titlebar.addEventListener('pointerdown', (event) => startDragging(event, windowEl));
  titlebar.addEventListener('pointermove', onDrag);
  titlebar.addEventListener('pointerup', stopDragging);
  titlebar.addEventListener('pointercancel', stopDragging);

  const controls = windowEl.querySelectorAll('.control');
  controls.forEach((control) => {
    control.addEventListener('click', (event) => {
      event.stopPropagation();
      const action = control.dataset.action;

      if (action === 'close') {
        closeWindow(windowEl);
      }

      if (action === 'minimize') {
        minimizeWindow(windowEl);
      }

      if (action === 'maximize') {
        maximizeWindow(windowEl);
        setActiveWindow(windowEl);
      }
    });
  });
}

function bindOpenActions(actionElements) {
  actionElements.forEach((item) => {
    item.addEventListener('click', (event) => {
      const targetId = event.currentTarget.getAttribute('data-open');
      openWindow(targetId);
      startMenu.classList.add('hidden');
    });
  });
}

function initializeWindowLayout() {
  windows.forEach((windowEl) => applyDefaultWindowLayout(windowEl.id));
}

updateClock();
setInterval(updateClock, 1000);

initializeWindowLayout();
windows.forEach(bindWindowEvents);

// --- Window Resizing Logic ---
let resizeState = null;

function startResizing(event, windowEl) {
  if (deviceMode !== 'desktop' || tilingMode || windowEl.classList.contains('maximized')) return;
  event.preventDefault();
  const rect = windowEl.getBoundingClientRect();
  const layerRect = windowLayer.getBoundingClientRect();
  resizeState = {
    windowEl,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: rect.width,
    startHeight: rect.height,
    minWidth: 320,
    minHeight: 160,
    maxWidth: layerRect.width,
    maxHeight: layerRect.height
  };
  document.body.style.cursor = 'se-resize';
}

function onResizing(event) {
  if (!resizeState) return;
  const dx = event.clientX - resizeState.startX;
  const dy = event.clientY - resizeState.startY;
  let newWidth = Math.max(resizeState.minWidth, Math.min(resizeState.startWidth + dx, resizeState.maxWidth));
  let newHeight = Math.max(resizeState.minHeight, Math.min(resizeState.startHeight + dy, resizeState.maxHeight));
  resizeState.windowEl.style.width = newWidth + 'px';
  resizeState.windowEl.style.height = newHeight + 'px';
}

function stopResizing() {
  if (!resizeState) return;
  document.body.style.cursor = '';
  resizeState = null;
}

// Attach resize events to all windows
windows.forEach((windowEl) => {
  const handle = windowEl.querySelector('.window-resize-handle');
  if (handle) {
    handle.addEventListener('pointerdown', (e) => startResizing(e, windowEl));
  }
});

window.addEventListener('pointermove', onResizing);
window.addEventListener('pointerup', stopResizing);
bindOpenActions(taskbarApps);
bindOpenActions(desktopIcons);
bindOpenActions(launchers);
bindOpenActions(startItems);

startButton.addEventListener('click', () => {
  if (deviceMode !== 'desktop') {
    return;
  }
  startMenu.classList.toggle('hidden');
});

tileToggle.addEventListener('click', () => {
  if (deviceMode !== 'desktop') {
    return;
  }
  toggleTiling();
});

document.addEventListener('click', (event) => {
  const clickedInsideStart = startMenu.contains(event.target);
  const clickedStartButton = startButton.contains(event.target);

  if (!clickedInsideStart && !clickedStartButton) {
    startMenu.classList.add('hidden');
  }
});

window.addEventListener('resize', () => {
  updateDeviceMode();

  if (tilingMode) {
    applyTiledLayout();
  }
});

updateDeviceMode();
if (deviceMode === 'desktop') {
  openWindow('hero');
} else {
  closeAllWindows();
}
