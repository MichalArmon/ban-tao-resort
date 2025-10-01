import { pub } from "../../../utils/publicPath";
import Hero from "../../components/Hero";
import IntroBlock from "../../components/IntroBlock";
import Pblock from "../../components/Pblock";
import TwinImages from "../../components/TwinImages";
import TwoImageGrid from "../../components/TwoImageGrid";

// קומפוננטת Home המנוקה:
function Home() {
  return (
    <>
      <Hero />

      {/* 🛑 פרלקס 1: באמצעות simpleParallax. התמונה עוברת כ-style prop. */}
      <div
        className="simpleParallax"
        style={{ backgroundImage: `url(${pub("landscape2.jpg")})` }}
      >
        {/* התוכן הנגלל נמצא בתוך ה-foregroundContent */}
        <div className="foregroundContent">
          <IntroBlock />
        </div>
      </div>
      <TwoImageGrid />
      <Pblock
        title="THOUGHTFUL DESIGN INSIDE AND OUT"
        text="SOL LIVING | PHANGAN sets a new standard for design . Every element of your villa has been meticulously crafted to combine beauty with functionality ."
        align="left"
      />
      <TwinImages />

      {/* 🛑 פרלקס 2: גם זה חייב להיות simpleParallax כדי שהמבנה יהיה עקבי */}
      <div
        className="simpleParallax"
        style={{ backgroundImage: `url(${pub("landscape4.jpg")})` }}
      >
        <div className="foregroundContent">
          {/* ה-Pblock שלך הוא התוכן של הפורגראונד */}
          <Pblock
            title="THOUGHTFUL DESIGN INSIDE AND OUT"
            text="SOL LIVING | PHANGAN sets a new standard for design . Every element of your villa has been meticulously crafted to combine beauty with functionality ."
            align="left"
          />
        </div>
      </div>
    </>
  );
}
export default Home;
