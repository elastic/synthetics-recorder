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

import { EuiThemeComputed, EuiThemeContext } from "@elastic/eui";
import React, { useContext } from "react";
import { ResultCategory } from "../common/types";

interface IActionStatusIndicator {
  status?: ResultCategory;
}

export function ActionStatusIndicator({ status }: IActionStatusIndicator) {
  const euiTheme = useContext(EuiThemeContext);

  return (
    <svg
      width="50"
      height="50"
      style={{ left: 26, top: 12, position: "relative" }}
    >
      <circle cx="25" cy="25" r="12" fill={euiTheme.colors.lightestShade} />
      <circle
        cx="25"
        cy="25"
        r="3"
        fill={getColorForStatus(euiTheme, status)}
      />
    </svg>
  );
}

function getColorForStatus(
  euiTheme: EuiThemeComputed,
  status?: ResultCategory
) {
  switch (status) {
    case "succeeded":
      return euiTheme.colors.success;
    case "skipped":
      return euiTheme.colors.warning;
    case "failed":
      return euiTheme.colors.danger;
    default:
      return euiTheme.colors.darkestShade;
  }
}