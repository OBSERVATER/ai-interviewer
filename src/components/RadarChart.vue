<template>
  <div ref="radarChartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as d3 from 'd3';
import type { RadarData } from '../types';

const props = defineProps<{
  data: RadarData;
}>();

const radarChartRef = ref<HTMLElement | null>(null);

const drawRadarChart = () => {
  if (!radarChartRef.value || !props.data) return;
  
  const chartData = Object.entries(props.data).map(([key, value]) => ({
    axis: key,
    value: value / 100
  }));

  const width = 300;
  const height = 300;
  const margin = 50;
  const radius = Math.min(width, height) / 2 - margin;
  
  d3.select(radarChartRef.value).selectAll("*").remove();
  
  const svg = d3.select(radarChartRef.value)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const angleSlice = (Math.PI * 2) / chartData.length;
  const rScale = d3.scaleLinear().range([0, radius]).domain([0, 1]);

  // Draw background circles
  const levels = 5;
  for (let i = 0; i < levels; i++) {
    const r = (radius / levels) * (i + 1);
    svg.append("circle")
      .attr("r", r)
      .attr("fill", "none")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-dasharray", "4 4");
  }

  // Draw axes
  const axis = svg.selectAll(".axis")
    .data(chartData)
    .enter()
    .append("g")
    .attr("class", "axis");

  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => rScale(1) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y2", (d, i) => rScale(1) * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("stroke", "#e5e7eb");

  axis.append("text")
    .attr("x", (d, i) => rScale(1.2) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y", (d, i) => rScale(1.2) * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .attr("fill", "#ffffff")
    .text(d => d.axis);

  // Draw radar area
  const radarLine = d3.lineRadial<any>()
    .radius(d => rScale(d.value))
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveLinearClosed);

  svg.append("path")
    .datum(chartData)
    .attr("d", radarLine)
    .attr("fill", "rgba(255, 255, 255, 0.2)")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 2);

  // Draw points
  svg.selectAll(".point")
    .data(chartData)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("r", 4)
    .attr("fill", "#ffffff");
};

onMounted(drawRadarChart);
watch(() => props.data, drawRadarChart, { deep: true });
</script>
