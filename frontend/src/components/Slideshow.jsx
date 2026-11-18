import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";

const SLIDES = [
  {
    id: 1,
    tag: "Food & Nutrition Aid",
    title: "Feeding Hope: Community Rations & Warm Meals",
    desc: "Every contribution delivers essential dry grocery hampers and freshly prepared meals directly to low-income families and daily-wage workers.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    link: "/donations",
    linkText: "Donation Records",
  },
  {
    id: 2,
    tag: "Child Education Support",
    title: "Nurturing Dreams: School Kits & Learning Supplies",
    desc: "Providing textbooks, backpacks, uniforms, and digital learning tools to children in municipal and rural community schools.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    link: "/beneficiaries",
    linkText: "Supported Children & Families",
  },
  {
    id: 3,
    tag: "Healthcare & Medical Aid",
    title: "Healing Hands: Free Health Checkups & Vision Camps",
    desc: "Bringing free doctor consultations, diagnostic screenings, critical prescription medicines, and spectacles to vulnerable elders.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    link: "/assistance",
    linkText: "Aid Delivery Log",
  },
  {
    id: 4,
    tag: "Shelter & Winter Relief",
    title: "Warmth & Dignity: Winter Blankets & Care Packages",
    desc: "Supplying thermal winter blankets, hygiene essentials, and emergency clothing kits to unhoused individuals across city shelters.",
    image: "https://plus.unsplash.com/premium_photo-1661964155049-f8a24a60be74?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    link: "/events",
    linkText: "Upcoming Relief Drives",
  },
];

export default function Slideshow({ canViewModules = true }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance slides every 4.2 seconds continuously
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4200);

    return () => clearInterval(timer);
  }, [paused]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <section
      className="slideshow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Community outreach highlights"
    >
      {SLIDES.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={slide.id}
            className={`slide ${isActive ? "is-active" : ""}`}
            aria-hidden={!isActive}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="slide__img"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div className="slide__overlay">
              <span className="slide__tag">
                <Icon name="heart" size={13} />
                {slide.tag}
              </span>
              <h3 className="slide__title">{slide.title}</h3>
              <p className="slide__desc">{slide.desc}</p>
              {canViewModules && slide.link && (
                <div style={{ marginTop: "14px" }}>
                  <Link
                    to={slide.link}
                    className="btn btn--sm"
                    style={{
                      background: "rgba(255, 255, 255, 0.95)",
                      color: "var(--primary-dark)",
                      fontWeight: 700,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                    }}
                  >
                    <span>{slide.linkText}</span>
                    <Icon name="chevronRight" size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Navigation Controls */}
      <button
        type="button"
        className="slideshow__ctrl slideshow__ctrl--prev"
        onClick={handlePrev}
        aria-label="Previous slide"
      >
        <Icon name="chevronLeft" size={20} />
      </button>

      <button
        type="button"
        className="slideshow__ctrl slideshow__ctrl--next"
        onClick={handleNext}
        aria-label="Next slide"
      >
        <Icon name="chevronRight" size={20} />
      </button>

      {/* Indicator Dots */}
      <div className="slideshow__dots" role="tablist">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`slideshow__dot ${index === current ? "is-active" : ""}`}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            role="tab"
            aria-selected={index === current}
          />
        ))}
      </div>
    </section>
  );
}
