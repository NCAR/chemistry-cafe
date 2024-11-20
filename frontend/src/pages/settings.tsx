import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { Header, Footer } from "../components/HeaderFooter";

import "../styles/settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const handleClick = () => navigate("/LoggedIn");

  const style = {
    height: "75px",
    width: "500px",
  };

  return (
    <section className="layoutSettings">
      <div className="L1Settings">
        <Header></Header>
      </div>

      <div className="M3Settings">
        <ButtonGroup orientation="vertical" variant="contained">
          <Button sx={style} onClick={handleClick}>
            Back
          </Button>
          <Button sx={style}>WIP</Button>
        </ButtonGroup>
      </div>

      <div className="L9Settings">
        <Footer></Footer>
      </div>
    </section>
  );
};

export default Settings;
