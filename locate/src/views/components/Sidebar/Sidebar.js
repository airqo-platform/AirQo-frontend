import React, {Component} from "react";

class Sidebar extends Component {
constructor(props) {
    super(props)

    this.state = {
         
    }
}

render(){
    return(
        <div>

        </div>
    );
}

}

Sidebar.propTypes = {
    rtlActive: PropTypes.bool,
    handleDrawerToggle: PropTypes.func,
    bgColor: PropTypes.oneOf(["purple", "blue", "green", "orange", "red"]),
    logo: PropTypes.string,
    image: PropTypes.string,
    logoText: PropTypes.string,
    routes: PropTypes.arrayOf(PropTypes.object),
    open: PropTypes.bool
}

Sidebar.defaultProps = {

}

export default Sidebar;