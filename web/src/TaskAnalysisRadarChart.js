// Copyright 2023 The Casibase Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use it except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import ReactEcharts from "echarts-for-react";
import i18next from "i18next";

const GROUP_LINE_COLORS = ["#c41d7f", "#1677ff", "#52c41a", "#d48806", "#531dab"];

/** PUA delimiter: prefix row index, join display label, parse in axisName.formatter; keeps group color mapping. */
const AXIS_ID_SEP = "\uE000";

/**
 * Flattens categories in order. Items under the same main dimension stay adjacent on the circle.
 * @param {Array<{name?: string, items?: object[], score?: number}>} categories
 * @param {boolean} useItems
 */
function buildFlatRows(categories, useItems) {
  const rows = [];
  (categories || []).forEach((cat, gIdx) => {
    const gName = (cat?.name ?? "").trim() || `—${gIdx + 1}—`;
    if (useItems) {
      const its = cat.items || [];
      if (its.length > 0) {
        its.forEach((item) => {
          rows.push({
            name: (item.name ?? "").trim() || gName,
            score: Number(item.score) || 0,
            groupIndex: gIdx,
            groupName: gName,
          });
        });
      } else {
        rows.push({
          name: (cat.name ?? "").trim() || gName,
          score: Number(cat.score) || 0,
          groupIndex: gIdx,
          groupName: gName,
        });
      }
    } else {
      rows.push({
        name: (cat.name ?? "").trim() || gName,
        score: Number(cat.score) || 0,
        groupIndex: gIdx,
        groupName: gName,
      });
    }
  });
  rows.forEach((row, i) => {
    const display = (row.name ?? "").replaceAll(AXIS_ID_SEP, "");
    row.axisKey = `${i}${AXIS_ID_SEP}${display}`;
  });
  return rows;
}

/** Escape `{` and `}` so rich-text axis labels are not parsed as ECharts style tokens. */
function escapeEchartsBraces(s) {
  return (s || "").replace(/[{}]/g, (c) => (c === "{" ? "［" : "］"));
}

export default function TaskAnalysisRadarChart({categories, radarMin = 0, radarMax, chartRef}) {
  if (!categories || categories.length === 0) {
    return null;
  }
  const hasItems = (categories || []).some((c) => (c.items || []).length > 0);
  const flat = buildFlatRows(categories, hasItems);
  if (flat.length === 0) {
    return null;
  }

  const groupNames = (categories || []).map((c, gIdx) => (c?.name ?? "").trim() || `—${gIdx + 1}—`);

  const rich = {};
  (categories || []).forEach((_, gIdx) => {
    rich[`g${gIdx}`] = {
      color: GROUP_LINE_COLORS[gIdx % GROUP_LINE_COLORS.length],
      fontSize: 9,
      lineHeight: 12,
    };
  });

  const showGroupLegend = groupNames.length > 0;

  const option = {
    /** Hovering the filled area otherwise opens a long tooltip; disabled per product request. */
    tooltip: {show: false},
    radar: {
      indicator: flat.map((r) => ({name: r.axisKey, min: radarMin, max: radarMax})),
      center: ["50%", "50%"],
      /** ~80%: radar web fills the chart area; nameGap kept small so long axis labels have room. */
      radius: "80%",
      splitNumber: 4,
      axisName: {
        formatter: (axisKey) => {
          if (!axisKey || typeof axisKey !== "string") {
            return "";
          }
          const p = axisKey.indexOf(AXIS_ID_SEP);
          const i = p >= 0 ? parseInt(axisKey.slice(0, p), 10) : 0;
          const sh = p >= 0 ? axisKey.slice(p + AXIS_ID_SEP.length) : axisKey;
          const gIdx = (flat[i] && Number.isInteger(flat[i].groupIndex)) ? flat[i].groupIndex : 0;
          return `{g${gIdx}|${escapeEchartsBraces(sh || "")}}`;
        },
        rich,
        margin: 2,
      },
      nameGap: 2,
      splitLine: {
        lineStyle: {color: "rgba(0,0,0,0.1)"},
      },
      splitArea: {
        show: true,
        areaStyle: {color: ["rgba(0,0,0,0.01)", "rgba(0,0,0,0.03)"]},
      },
    },
    series: [{
      type: "radar",
      name: i18next.t("task:Score"),
      data: [{
        value: flat.map((r) => r.score),
        name: i18next.t("task:Score"),
        lineStyle: {color: "rgba(22, 119, 255, 0.85)"},
        areaStyle: {opacity: 0.3, color: "rgba(22, 119, 255, 0.35)"},
        symbol: "circle",
        symbolSize: 3,
      }],
    }],
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{flex: 1, minHeight: 0, position: "relative"}}>
        <ReactEcharts
          ref={chartRef}
          option={option}
          style={{width: "100%", height: "100%"}}
          notMerge
        />
      </div>
      {showGroupLegend ? (
        <div
          style={{
            flexShrink: 0,
            paddingTop: "4px",
            textAlign: "center",
            fontSize: 12,
            lineHeight: 1.5,
            color: "rgba(0,0,0,0.88)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px 16px",
          }}
        >
          {groupNames.map((n, i) => (
            <span key={i} style={{whiteSpace: "nowrap", maxWidth: "100%"}}>
              <span
                style={{
                  color: GROUP_LINE_COLORS[i % GROUP_LINE_COLORS.length],
                  marginRight: 4,
                }}
                aria-hidden
              >
                ●
              </span>
              {n}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
