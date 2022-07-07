import React from "react";
import PropTypes from 'prop-types';

export const CardStack = ({ children, size }) => {
  const paddingRight = size === 'xs' ? 30 : size === 's' ? 80 : size === 'm' ? 120 : 144;
  const paddingBottom = size === 'xs' ? 30 : size === 's' ? 80 : size === 'm' ? 120 : 144;

  return (
    <div style={{ display: 'inline-block', paddingRight: `${paddingRight}px`, paddingBottom: `${paddingBottom}px`, fontSize: 0, letterSpacing: 0, wordSpacing: 0 }}>
      {React.Children.map(children, (child, i) => React.cloneElement(child, { stack: true, size, style:{ marginRight: `-${paddingRight}px`, marginBottom: `-${paddingBottom}px` } }))}
    </div>
  );
}

CardStack.defaultProps = {
  size: 'm'
}

CardStack.propTypes = {
  size: PropTypes.oneOf(['xs', 's', 'm', 'l'])
}

export default CardStack;