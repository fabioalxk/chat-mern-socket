import React, { useState } from "react";
import closeIcon from "../../icons/closeIcon.png";

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarText
} from "reactstrap";

import "./InfoBar.css";

const InfoBar = ({ room }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div>
      <Navbar color="dark" dark expand="md">
        <NavbarBrand href="/">{room}</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar></Nav>
          <NavbarText>
            {" "}
            <a href="/">
              <img src={closeIcon} alt="close icon" />
            </a>
          </NavbarText>
        </Collapse>
      </Navbar>
    </div>
  );
};

export default InfoBar;
