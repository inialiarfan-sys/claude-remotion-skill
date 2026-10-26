import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { PAPER_TEXTURE } from "../../assets";
import { theme } from "../../theme";
import { CinematicCamera } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Grade, Grain, PaperOverlay, Stars, Vignette } from "../../components/Atmosphere";
import { House, Palm } from "../../components/Architecture";
import { Caravan, Kaaba, Sheep, Stall } from "../../components/Props";
import { AgeTimeline } from "../../components/AgeTimeline";
import { InkCaption, ScrollCaption } from "../../components/WorldCaption";
import { ridgePath } from "../../components/shapes";
import { clamp } from "../../components/textMotion";

const C = theme.colors;
const START = 40;
const YEAR = 160; // frames per illustrative year
const AGES = [9, 10, 11, 12];
export const CH1_S7_BEATS = {
  start: START,
  year: YEAR,
  // night of each illustrative day (scene-relative frames), for the insect bed
  nights: AGES.map((_, k) => [START + k * YEAR + Math.round(0.58 * YEAR), START + k * YEAR + Math.round(0.95 * YEAR)] as [number, number]),
  shepherd: START + 4 * YEAR - 30,
};

// one day per year-marker: dawn → noon → dusk → night
const DAY = [0, 0.25, 0.5, 0.62, 0.8, 1];
const SKY_TOP = ["#3a4a7a", "#4a7ab8", "#4a3a6a", "#0a1030", "#060a1f", "#3a4a7a"];
const SKY_LOW = ["#f0b27a", "#f6e2b8", "#f08a4a", "#2a2a4a", "#141a33", "#f0b27a"];
const GROUND = ["#a8784a", "#c99a62", "#9a5a36", "#2a2230", "#1e1a26", "#a8784a"];
const HILL = ["#7a5a5a", "#9a7a70", "#6a3a40", "#1e1a30", "#141428", "#7a5a5a"];

export const Ch1Scene07Years: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - START) / YEAR;
  const day = t - Math.floor(t);
  const col = (stops: string[]) => interpolateColors(day, DAY, stops);
  const sunA = interpolate(day, [0, 0.55], [-0.1, 1.1], clamp);
  const daylight = interpolate(day, [0, 0.08, 0.5, 0.62], [0.2, 1, 1, 0], clamp);
  const night = interpolate(day, [0.55, 0.66, 0.9, 1], [0, 1, 1, 0], clamp);
  const sunX = 80 + sunA * 920;
  const sunY = 1100 - Math.sin(Math.max(0, Math.min(1, sunA)) * Math.PI) * 540;
  const shadowSkew = (540 - sunX) * 0.9;
  // the town grows year by year: upper rooms are raised, the palm grows, the flock increases
  const built = (k: number) => interpolate(frame, [START + k * YEAR + 20, START + k * YEAR + 60], [0, 1], { ...clamp, easing: theme.ease.out });
  const palmGrow = interpolate(frame, [START, START + 4 * YEAR], [0.82, 1.1], clamp);
  const leaf = AGES.map((_, i) => interpolate(frame, [START + i * YEAR - 4, START + i * YEAR + 10], [0, 1], clamp));
  const end = dur - 38;

  return (
    <AbsoluteFill style={{ background: C.void }}>
      {/* a slow push into the growing town across the four years */}
      <CinematicCamera keys={[{ f: 0, x: 60, y: 40, zoom: 1.0 }, { f: START + 4 * YEAR, x: -40, y: 60, zoom: 1.18 }, { f: dur, x: -46, y: 62, zoom: 1.19 }]} drift={0.4}>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${col(SKY_TOP)} 0%, ${col(SKY_LOW)} 64%)` }} />
        <Stars seed={707} count={200} top={-300} bottom={1000} opacity={night} spin={0.05} />
        <DepthFill depth={0.05}>
          <div
            style={{
              position: "absolute",
              left: sunX - 66,
              top: sunY - 66,
              width: 132,
              height: 132,
              borderRadius: "50%",
              background: "radial-gradient(circle, #fff6d8, #ffd27a 70%)",
              boxShadow: "0 0 90px 40px rgba(255,210,130,0.4)",
              opacity: daylight,
            }}
          />
        </DepthFill>
        <PaperLayer depth={0.12} shadow={10} render={(p) => <path d={ridgePath(701, { x0: -420, x1: 1500, base: 1080, amp: 460, peaks: 4, bottom: 1500 })} fill={p(col(HILL))} />} />
        {/* hillside pasture; the flock grows from year to year */}
        <PaperLayer
          depth={0.3}
          shadow={12}
          render={(p) => (
            <g>
              <path d={ridgePath(703, { x0: -420, x1: 1500, base: 1210, amp: 160, peaks: 3, bottom: 1700, rough: 0.2 })} fill={p(interpolateColors(day, DAY, ["#8a6a4a", "#a8845a", "#7a4a30", "#221c28", "#18141e", "#8a6a4a"]))} />
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const show = i < 2 ? 1 : built(Math.floor(i / 2));
                return show > 0 ? (
                  <g key={i} opacity={show}>
                    <Sheep p={p} x={140 + i * 64 + Math.sin(frame / 120 + i) * 30} y={1150 + (i % 3) * 14} s={0.55} flip={i % 2 === 0} graze={(Math.sin(frame / 22 + i) + 1) / 2} />
                  </g>
                ) : null;
              })}
            </g>
          )}
        />
        {/* Makkah: houses with shadows that swing through each day */}
        <PaperLayer
          depth={0.5}
          shadow={14}
          render={(p) => (
            <g>
              <rect x={-400} y={1380} width={1900} height={700} fill={p(col(GROUND))} />
              {Array.from({ length: 9 }).map((_, i) => {
                const x = -160 + i * 160;
                const h = 140 + (i % 3) * 50;
                const body = interpolateColors(day, DAY, ["#c09060", "#d8a870", "#a8603a", "#2e2630", "#241e28", "#c09060"]);
                const upper = i === 2 ? built(1) : i === 6 ? built(2) : 0;
                return (
                  <g key={i}>
                    <path
                      d={`M${x} 1380 L${x + 120} 1380 L${x + 120 + shadowSkew} ${1380 + h * 0.35} L${x + shadowSkew} ${1380 + h * 0.35} Z`}
                      fill="#000000"
                      opacity={0.28 * daylight}
                    />
                    {upper > 0 ? (
                      <g transform={`translate(0 ${1380 - h}) scale(1 ${upper}) translate(0 ${-(1380 - h)})`}>
                        <rect x={x + 20} y={1380 - h - 70} width={80} height={72} fill={p(body)} />
                        <rect x={x + 50} y={1380 - h - 52} width={16} height={24} rx={2} fill={p(night > 0.3 ? C.lamp : "#2a1a10")} />
                      </g>
                    ) : null}
                    <House p={p} x={x} base={1380} w={120} h={h} body={body} shade="#5a3a22" dark="#2a1a10" lamp={C.lamp} lit={night > 0.3 ? 0.6 : 0} seed={i + 720} />
                  </g>
                );
              })}
              <Kaaba p={p} x={500} base={1386} w={88} h={84} />
            </g>
          )}
        />
        <PaperLayer
          depth={0.85}
          shadow={20}
          render={(p) => (
            <g>
              <rect x={-400} y={1560} width={1900} height={900} fill={p(interpolateColors(day, DAY, ["#8a5a36", "#a06a40", "#7a3e24", "#1a1418", "#141016", "#8a5a36"]))} />
              {built(3) > 0 ? (
                // a new stall appears in the last year
                <g opacity={built(3)}>
                  <Stall p={p} x={680} base={1640} w={230} stripes={["#2e4a7a", "#e8d2a8"]} arrange={built(3)} seed={77} flutter={frame / 11} />
                </g>
              ) : null}
              <Caravan p={p} x={-300} y={1640} n={3} gap={190} walk={(frame * 2.2) % 2200} s={0.85} color="#3a2414" load="#8a3b2a" />
            </g>
          )}
        />
        <PaperLayer
          depth={1.25}
          shadow={26}
          shadowOpacity={0.7}
          render={(p) => (
            <g transform={`translate(980 1960) scale(${palmGrow}) translate(-980 -1960)`}>
              <Palm p={p} x={980} base={1960} h={640} lean={-0.12} color="#1e1610" seed={77} sway={Math.sin(frame / 40) * 5} />
            </g>
          )}
        />
      </CinematicCamera>
      {/* the turning leaf that marks each year */}
      {leaf.map((l, i) =>
        l > 0 && l < 1 ? (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `polygon(${100 - l * 160}% 0, ${160 - l * 160}% 0, ${140 - l * 160}% 100%, ${80 - l * 160}% 100%)`,
              background: `linear-gradient(90deg, rgba(60,35,10,0.9) 0%, ${C.parchmentDark} 8%, ${C.parchmentLight} 60%, ${C.parchmentDark} 100%)`,
              boxShadow: "inset 0 0 40px rgba(60,35,10,0.5)",
            }}
          >
            <AbsoluteFill style={{ backgroundImage: `url(${PAPER_TEXTURE})`, backgroundSize: "512px", mixBlendMode: "multiply" }} />
          </AbsoluteFill>
        ) : null,
      )}
      <InkCaption lines={["Tahun demi tahun berlalu di Makkah…"]} start={8} end={START + 90} top={420} size={46} italic weight={500} tracking={0.01} color={C.parchmentLight} shadow />
      {AGES.map((age, i) => (
        <InkCaption
          key={age}
          lines={[`USIA ${age} TAHUN`]}
          start={START + i * YEAR + 10}
          end={START + (i + 1) * YEAR - 4}
          top={250}
          size={78}
          tracking={0.14}
          color={C.goldLight}
          shadow
          per={22}
        />
      ))}
      <AgeTimeline
        marks={AGES.map((a, i) => ({ label: `${a} TAHUN`, at: START + i * YEAR + 6 }))}
        top={1480}
        start={START - 10}
        end={end}
        note="Penanda usia ini ilustrasi peredaran masa"
      />
      <ScrollCaption
        lines={["Baginda pernah mengembala kambing", "untuk penduduk Makkah."]}
        sub="Sahih al-Bukhari · usia tidak dinyatakan dalam riwayat"
        start={CH1_S7_BEATS.shepherd}
        end={end}
        top={400}
        size={38}
        subSize={25}
      />
      <Grade warmth={0.08} />
      <PaperOverlay />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
