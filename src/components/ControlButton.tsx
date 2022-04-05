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

import {
  EuiButton,
  EuiButtonProps,
  EuiButtonIcon,
  EuiButtonIconProps,
  EuiThemeContext,
  EuiToolTip,
} from "@elastic/eui";
import React, { useContext, useEffect, useState } from "react";

interface IControlButton {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  tooltipContent?: string;
}

type Props = IControlButton & EuiButtonIconProps & EuiButtonProps;

export const ControlButton: React.FC<Props> = props => {
  const [showIconOnly, setShowIconOnly] = useState(false);
  const {
    breakpoint: { l },
  } = useContext(EuiThemeContext);

  useEffect(() => {
    function evaluateSize() {
      if (window.innerWidth >= l && showIconOnly) {
        setShowIconOnly(false);
      } else if (window.innerWidth < l && !showIconOnly) {
        setShowIconOnly(true);
      }
    }
    window.addEventListener("resize", evaluateSize);
    return () => window.removeEventListener("resize", evaluateSize);
  }, [l, showIconOnly]);

  const { fill, tooltipContent, ...rest } = props;
  const button = showIconOnly ? (
    <EuiButtonIcon display={fill ? "fill" : "base"} size="m" {...rest} />
  ) : (
    <EuiButton fill={fill} {...rest} />
  );
  const ttContent = tooltipContent || (showIconOnly && props["aria-label"]);
  if (ttContent) {
    return (
      <EuiToolTip content={ttContent} delay="long">
        {button}
      </EuiToolTip>
    );
  }

  return button;
};
