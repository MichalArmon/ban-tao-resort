import { pub } from "../../../utils/publicPath";
import Hero from "../../components/Hero";
import IntroBlock from "../../components/IntroBlock";
import Pblock from "../../components/Pblock";
import TwinImages from "../../components/TwinImages";
import TwoImageGrid from "../../components/TwoImageGrid";

function InvestorsMainPage() {
  return (
    <>
      {" "}
      <div className="wrapper">
        {" "}
        {/* כפתור שיחה צף בפינה */}
        <Hero />
        <IntroBlock />
        <TwoImageGrid />
        <div className="picDiv">
          {" "}
          <img
            className="bgImage"
            src={pub("landscape2.jpg")}
            alt="Landscape"
          />
        </div>
        {/* <FullScreenImage src="/landscape2.jpg" navH={72} durationVH={100} /> */}
        <Pblock
          title="THOUGHTFUL DESIGN INSIDE AND OUT"
          text="SOL LIVING | PHANGAN sets a new standard for design . Every element of your villa has been meticulously crafted to combine beauty with functionality ."
          align="left"
        />
        <TwinImages />
        <div className="picDiv">
          {" "}
          <img
            className="bgImage"
            src={pub("landscape4.jpg")}
            alt="Landscape 3"
          />
        </div>
        <Pblock
          title="THOUGHTFUL DESIGN INSIDE AND OUT"
          text="SOL LIVING | PHANGAN sets a new standard for design . Every element of your villa has been meticulously crafted to combine beauty with functionality ."
          align="left"
        />
      </div>
    </>
  );
}

export default InvestorsMainPage;
