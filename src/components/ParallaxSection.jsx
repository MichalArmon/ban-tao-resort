import TwinImages from "./TwinImages";

function ParallaxSection({ image, children }) {
  return (
    <section className="parallax">
      <div className="parallax-bg">
        <img src={image} alt="" />
      </div>

      <div className="parallax-content">{children}</div>
    </section>
  );
}

export default ParallaxSection;
