import {
  findWindows,
  setForegroundWindow,
  sendText,
  sendAltTab
  // sendAltTab
} from 'modules/win32';

const execute = async () => {
  const [poeWindow, aggWindow] = findWindows(
    'Draener - Discord',
    'win32.js - win32-tester - Visual Studio Code'
  );

  if (!poeWindow || !aggWindow) {
    // eslint-disable-next-line
    console.dir(poeWindow);
    // eslint-disable-next-line
    console.dir(aggWindow);
    // eslint-disable-next-line
    console.error('Couldn\'t find a window!');
    return;
  }

  setForegroundWindow(poeWindow);
  await sendText(poeWindow, 'lolol');
  await sendAltTab();
};

execute();
