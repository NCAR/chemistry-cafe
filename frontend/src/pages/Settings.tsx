import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { Header, Footer } from "../components/HeaderFooter";

import "../styles/settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const style = {
    height: "75px",
    width: "500px",
  };

  return (
    <section className="layout-settings">
      <header>
        <Header />
      </header>

      <section className="content-settings">
        <ButtonGroup orientation="vertical" variant="contained">
          <Button sx={style} onClick={goBack}>
            Back
          </Button>
          <Button sx={style}>WIP</Button>
        </ButtonGroup>
      </section>

      <footer>
        <Footer />
      </footer>
    </section>
  );
};

export default Settings;
