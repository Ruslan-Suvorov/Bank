import "./index.scss";
import Heading from "../../component/Heading";
import Button from "../../component/Button";
import Safe from "../../images/safe.png";
import { useNavigate } from "react-router-dom";

const WellcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="wellcome-page">
      <div className="page-background-img">
        <Heading title="Hello!" text="Welcome to bank app" wellcomePage />
        <img src={Safe} alt="safe" className="image" />
      </div>

      <div className="field-button">
        <Button primary label="Sign Up" onClick={() => navigate("/signup")} />
        <Button label="Sign In" onClick={() => navigate("/signin")} />
      </div>
    </div>
  );
}

export default WellcomePage;