import { U, DTypes } from 'win32-api';
import { address, alloc } from 'ref-napi';
// import Struct from 'ref-struct-napi';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const user32 = U.load();

const {
  FindWindowExW: findWindowExW,
  SetForegroundWindow,
  SendMessageW: sendMessageW
} = user32;

// Message types
// const WM_KEYDOWN = 0x100;
// const WM_KEYUP = 0x101;
const WM_CHAR = 0x102;
const WM_SYSKEYDOWN = 0x104;
const WM_SYSKEYUP = 0x105;

// Key codes
const VK_MENU = 0x12; // Alt

const encodeString = (string) => Buffer.from(`${string}\0`, 'ucs2');

/**
 * Finds a window by name
 * @param {String} name Window name
 * @returns Handle or 0 if no matching window found
 */
const findWindow = (name) => findWindowExW(0, 0, null, encodeString(name));

/**
 * Finds one or more windows by name
 * @param  {...any} names One or more strings representing window names
 * @returns Array of handles, handle is 0 if no matching window found
 */
export const findWindows = (...names) => names.map(findWindow);

/**
 * Sets the current active window by handle. Only works if our window is active.
 */
export const setForegroundWindow = SetForegroundWindow;

// const convertAsciiToVirtualKeyCode = (char) => {
//   const code = char.charCodeAt(0);

//   // return undefined key code for special ASCII characters
//   if (code < 0x20) {
//     return 0x07;
//   }

//   switch (code) {
//     // return Backspace for ASCII DEL
//     case 0x7f:
//       return 0x08;
//     // pass all other codes through
//     default:
//       return code;
//   }
// };

const prepareParams = (
  wParamType,
  lParamType,
  wParamBuilder,
  lParamBuilder
) => {
  const [wParamBuf, lParamBuf] = [alloc(wParamType), alloc(lParamType)];

  try {
    wParamBuilder(wParamBuf);
    lParamBuilder(lParamBuf);
  } catch (error) {
    // eslint-disable-next-line
    console.error('Failed to invoke wParamBuilder or lParamBuilder!');
    return [];
  }

  // eslint-disable-next-line
  console.dir(wParamBuf);
  // eslint-disable-next-line
  console.dir(lParamBuf);

  return [address(wParamBuf), address(lParamBuf)];
};

const sendCharacter = (hWnd, char) => {
  const [wParam, lParam] = prepareParams(
    DTypes.WPARAM,
    DTypes.LPARAM,
    (buf) => buf.writeInt32LE(char.charCodeAt(0)),
    (buf) => buf.writeUInt64LE(0b0000000000000000000000000000001)
  );

  sendMessageW(hWnd, WM_CHAR, wParam, lParam);
};

export const sendText = async (hWnd, text) => {
  if (text.length < 1 && !text.endsWith('\n')) {
    text += '\n';
  }

  text.split('').forEach((char) => sendCharacter(hWnd, char));
};

export const sendAltTab = async (hWnd) => {
  sendMessageW(hWnd, WM_SYSKEYDOWN, VK_MENU);
  await sleep(1000);
  sendMessageW(hWnd, WM_SYSKEYUP, VK_MENU);
};
