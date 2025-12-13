const { useEffect, useRef, useState } = React;

const socket = io("http://localhost:3001");

const ZONE_COORDS = {
  rim: [250, 50],
  paint: [250, 120],
  midrange: [250, 200],
  corner3: [70, 40],
  arc3: [250, 300],
  unknown: [250, 250], // Default for unmapped shots
};

function ShotHeatmap() {
  const canvasRef = useRef(null);
  const [shots, setShots] = useState([]);

  useEffect(() => {
    socket.on("shot", (shot) => {
      setShots((prev) => [...prev, shot]);
    });

    return () => socket.off("shot");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Clear canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Optional: Draw a basic court outline for context
    drawCourt(ctx);

    const zoneCounts = shots.reduce((acc, s) => {
        if (!acc[s.zone]) {
            acc[s.zone] = { made: 0, total: 0 };
        }
        acc[s.zone].total++;
        if (s.made) {
            acc[s.zone].made++;
        }
        return acc;
    }, {});

    Object.entries(zoneCounts).forEach(([zone, data]) => {
        const [x, y] = ZONE_COORDS[zone] || ZONE_COORDS.unknown;
        const percentage = data.total > 0 ? data.made / data.total : 0;

        // Determine color based on hot/cold logic
        const color = getZoneColor(percentage);

        // Intensity based on shot volume (more shots = more opaque)
        const intensity = Math.min(0.1 + (data.total / 10), 0.8);
        const radius = 35 + (data.total * 2); // Radius grows with more shots

        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, `${color}, ${intensity})`);
        grad.addColorStop(1, `${color}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    });

  }, [shots]);

  function getZoneColor(pct) {
    if (pct < 0.40) return "rgba(0, 150, 255"; // Blue for cold
    if (pct >= 0.40 && pct <= 0.55) return "rgba(255, 255, 0"; // Yellow for neutral
    return "rgba(255, 0, 0"; // Red for hot
  }

  function drawCourt(ctx) {
    // Basic court outline
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    // Key
    ctx.strokeRect(190, 0, 120, 190);
    // 3-point line
    ctx.beginPath();
    ctx.arc(250, 0, 239, 0, Math.PI, false);
    ctx.moveTo(11, 0);
    ctx.lineTo(11, 140);
    ctx.moveTo(489, 0);
    ctx.lineTo(489, 140);
    ctx.stroke();
    // Backboard and rim
    ctx.strokeRect(220, 40, 60, 1);
    ctx.beginPath();
    ctx.arc(250, 50, 7.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  return React.createElement('canvas', { ref: canvasRef, width: 500, height: 470 });
}
