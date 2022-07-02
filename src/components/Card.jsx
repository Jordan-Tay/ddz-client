import React, { useRef, useState } from "react";
import PropTypes from 'prop-types';
import { encodeCard } from "../utils";
import './Card.css';
import { CSSTransition } from "react-transition-group";

export const Card = ({ rank, suit, back, id, style, size, onClick }) => {
  const [selected, setSelected] = useState(false);
  const nodeRef = useRef(null);

  if (!id) {
    if (rank < 0 || rank > 13) {
      return null;
    } 

    if (suit < 0 || suit > 3) {
      return null;
    }

    if (rank === 0 && suit > 1) {
      return null;
    }
  } else if (id < 1 || id > 54) {
    return null;
  }

  const importAll = r => {
    let images = {};
    r.keys().forEach(item => {
      images[item.replace('./', '').replace('.svg', '')] = r(item);
    });
    return images;
  }
  
  // @ts-ignore
  const images = importAll(require.context('../cards', false, /\.svg$/));
  const index = (id ? id : encodeCard({ rank, suit })) * 2 - (back ? 0 : 1);
  const image = String(index).padStart(3, '0');

  return (
    <CSSTransition nodeRef={nodeRef} in={selected} timeout={200} classNames='lift'>
      <div ref={nodeRef} style={{ position: 'relative', display: 'inline-block', cursor: onClick ? 'pointer' : 'default', ...style }} onClick={() => {
        onClick();
        setSelected(!selected);
      }}>
        <img style={{ width: size === 's' ? '100px' : size === 'm' ? '150px' : '180px', display: 'block' }} src={images[image]} alt={image} />
      </div>
    </CSSTransition>
  );
}

Card.defaultProps = {
  id: 1,
  back: false,
  style: {},
  size: 'm',
  onClick: null
}

Card.propTypes = {
  rank: PropTypes.number,
  suit: PropTypes.number,
  id: PropTypes.number,
  back: PropTypes.bool,
  style: PropTypes.object,
  size: PropTypes.oneOf(['s', 'm', 'l']),
  onClick: PropTypes.func
};

export default Card;
