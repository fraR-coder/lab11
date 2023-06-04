import { useState } from "react";
import { ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function MySideBar(props) {
  const {items, selected, setName} = props;

  const filters = Object.entries(items);
  const navigate=useNavigate();
  
    return (
      <aside className="collapse col-12 d-md-block col-md-3 bg-light below-nav" id="left-sidebar">
        <ListGroup className="list-group list-group-flush">
          {filters.map(([filter, { label }]) => (
            <ListGroup.Item
              key={filter}
              action onClick={() => {setName(filter); navigate("/"+label); props.setUpdated(true)}}
              active={selected === filter}
            >
              {label}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </aside>
    );
  }
export default MySideBar;
