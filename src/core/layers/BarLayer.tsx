import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import PollingResizingCanvasLayer from './PollingResizingCanvasLayer';
import { getIndexBoundsForSpanData } from '../renderUtils';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import propTypes from '../propTypes';
import { Color, Interval, SpanDatum } from '../interfaces';

export interface Props {
  data: SpanDatum[];
  xDomain: Interval;
  yDomain: Interval;
  color?: Color;
}

@PureRender
@NonReactRender
@PixelRatioContext
class BarLayer extends React.Component<Props, void> {
  context: Context;

  static propTypes = {
    data: React.PropTypes.arrayOf(propTypes.spanDatum).isRequired,
    xDomain: propTypes.interval.isRequired,
    yDomain: propTypes.interval.isRequired,
    color: React.PropTypes.string
  } as React.ValidationMap<Props>;

  static defaultProps = {
    color: 'rgba(0, 0, 0, 0.7)'
  } as any as Props;

  render() {
    return <PollingResizingCanvasLayer
      ref='canvasLayer'
      onSizeChange={this.nonReactRender}
      pixelRatio={this.context.pixelRatio}
    />;
  }

  nonReactRender = () => {
    const { width, height, context } = (this.refs['canvasLayer'] as PollingResizingCanvasLayer).resetCanvas();

    const { firstIndex, lastIndex } = getIndexBoundsForSpanData(this.props.data, this.props.xDomain, 'minXValue', 'maxXValue');
    if (firstIndex === lastIndex) {
      return;
    }

    const xScale = d3Scale.scaleLinear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);

    const yScale = d3Scale.scaleLinear()
      .domain([ this.props.yDomain.min, this.props.yDomain.max ])
      .rangeRound([ 0, height ]);

    context.beginPath();
    for (let i = firstIndex; i < lastIndex; ++i) {
      const left = xScale(this.props.data[i].minXValue);
      const right = xScale(this.props.data[i].maxXValue);
      const top = height - yScale(this.props.data[i].yValue);
      const bottom = height - yScale(0);

      context.rect(left, bottom, right - left, top - bottom);
    }

    context.fillStyle = this.props.color;
    context.fill();
  };
}

export default wrapWithAnimatedYDomain(BarLayer);