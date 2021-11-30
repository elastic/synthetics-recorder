/*
MIT License

Copyright (c) 2021-present, Elastic NV

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import React from "react";
import { StepTitleEditField } from "./StepTitleEditField";
import { render } from "@testing-library/react";

/*
 * This test block is included as an example for the initial
 * implementation of unit testing infrastructure as a part
 * of https://github.com/elastic/synthetics-recorder/issues/75.
 *
 * If you're writing more robust tests for this component, feel
 * free to delete this comment and update the test.
 */
describe("<StepTitleEditField />", () => {
  it("renders component", () => {
    const { getByLabelText } = render(
      <StepTitleEditField
        onStepTitleChange={jest.fn()}
        setIsEditing={jest.fn()}
        title="Hello there!"
      />
    );
    expect(getByLabelText("Sets the title for the current step."));
  });
});
