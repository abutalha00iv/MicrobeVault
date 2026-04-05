"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type GraphNode = {
  id: string;
  group: "microbe" | "host";
  label: string;
};

type GraphLink = {
  source: string;
  target: string;
  relationship: string;
};

export function EcologyGraph({ nodes, links }: { nodes: GraphNode[]; links: GraphLink[] }) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.clientWidth || 960;
    const height = 560;

    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(links).id((d: unknown) => (d as GraphNode).id).distance(140))
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "rgba(0,245,212,0.28)")
      .attr("stroke-width", 1.5);

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => (d.group === "microbe" ? 10 : 14))
      .attr("fill", (d) => (d.group === "microbe" ? "#00F5D4" : "#FFB627"))
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on("start", (event, dragged) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            dragged.fx = dragged.x;
            dragged.fy = dragged.y;
          })
          .on("drag", (_event, dragged) => {
            dragged.fx = _event.x;
            dragged.fy = _event.y;
          })
          .on("end", (event, dragged) => {
            if (!event.active) simulation.alphaTarget(0);
            dragged.fx = null;
            dragged.fy = null;
          })
      );

    const labels = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d) => d.label)
      .attr("fill", "#E2E8F0")
      .attr("font-size", 12)
      .attr("dx", 14)
      .attr("dy", 4);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as d3.SimulationNodeDatum).x ?? 0)
        .attr("y1", (d) => (d.source as d3.SimulationNodeDatum).y ?? 0)
        .attr("x2", (d) => (d.target as d3.SimulationNodeDatum).x ?? 0)
        .attr("y2", (d) => (d.target as d3.SimulationNodeDatum).y ?? 0);

      node.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);
      labels.attr("x", (d) => d.x ?? 0).attr("y", (d) => d.y ?? 0);
    });

    return () => {
      simulation.stop();
    };
  }, [links, nodes]);

  return <svg ref={ref} className="glass-panel h-[560px] w-full rounded-[2rem]" viewBox="0 0 960 560" />;
}

