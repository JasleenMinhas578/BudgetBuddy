// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { act as reactAct } from 'react';
import * as ReactDOMTestUtils from 'react-dom/test-utils';

ReactDOMTestUtils.act = reactAct;

const SILENCED_CONSOLE_METHODS = ['error', 'warn'];

if (process.env.SHOW_JEST_LOGS !== 'true') {
  beforeAll(() => {
    SILENCED_CONSOLE_METHODS.forEach((method) => {
      jest.spyOn(console, method).mockImplementation(() => {});
    });
  });

  afterAll(() => {
    SILENCED_CONSOLE_METHODS.forEach((method) => {
      const spy = console[method];
      if (spy && typeof spy.mockRestore === 'function') {
        spy.mockRestore();
      }
    });
  });
}