/**
 * GlobePreview — Globe 引擎首帧之前的**轻量静态预览**（纯 CSS，零 JS 运算、零网络）。
 *
 * 定位：首屏非关键路径的一部分 —— 页面布局 / 搜索 / 控件立即出现，地图区域先用与
 * MapLibre 深空球面同一色族的静态球体占位（空间 #342f31 + 暖炭黑球面 + 边缘大气光晕，
 * 色值与 map-engine.ts 的 UTRIPLA_SPACE_PALETTE / UTRIPLA_MAP_PALETTE 同源），
 * 引擎 ready 后淡出，由真实 canvas 无缝接管。不是 spinner，也不是降级视觉。
 */
export default function GlobePreview({ visible = true }: { visible?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background: "#342f31",
        opacity: visible ? 1 : 0,
        transition: "opacity 480ms ease-out",
      }}
    >
      <div
        className="aspect-square h-[122%] shrink-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, #262224 0%, #1b181a 52%, #211d1e 78%, #2b2726 100%)",
          boxShadow:
            "0 0 90px 6px rgba(76,70,72,0.42), 0 0 240px 48px rgba(52,47,49,0.55)",
        }}
      />
    </div>
  );
}
