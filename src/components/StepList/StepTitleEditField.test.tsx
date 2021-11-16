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
