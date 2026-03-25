import React, { useEffect, useMemo, useState } from "react";

/**
 * AMCHAM Full Email + Agenda Editor
 * - Pretty UI (no Tailwind dependency required)
 * - Edit event info + timetable blocks
 * - Inline edit inside preview
 * - Import modified HTML back into editor
 * - Export / Import JSON backup
 * - Reset to provided baseline template
 */

const uid = () => Math.random().toString(36).slice(2, 10);
const STORAGE_KEY = "amcham_full_email_editor_pretty_v2";

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeHtml(s) {
  return (s ?? "").toString().trim();
}

function textFromHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || "").trim();
}

function cloneDefault() {
  return {
    width: 800,
    tableFont: "Arial",
    bannerUrl: "웹배너 링크 넣기",
    dateLine: "Day, Month date, 2026",
    timeLine: "0:00 am - 0:00 pm",
    venue: "TBD",
    topicHtml: "TBD",
    description: "TBD",
    costHtml:
      "• Member Companies: KRW 00 per admission<br>• Non-Member Companies: KRW 00 per admission",
    rsvpBy: "TBD",
    rsvpNotesHtml:
      "* Registration must be completed in advance.<br>* Free cancelations will be accepted only until TBD (12pm noon).",
    contactEmail: "rsvp@amchamkorea.org",
    contactPhone: "",
    timetableTitle: "Event Timetable",
    blocks: [
      {
        id: uid(),
        type: "simple",
        time: "8:30am - 9:00am",
        label: "Registration & Networking",
        bold: true,
        highlight: false,
        centerLabel: false,
      },
      { id: uid(), type: "header", title: "Program Opening" },
      {
        id: uid(),
        type: "session",
        time: "9:00am – 9:05am",
        title: "Opening Remarks",
        speakers: [
          {
            id: uid(),
            name: "James Kim",
            title: "Chairman & CEO",
            org: "AMCHAM Korea",
            photoUrl:
              "https://www.amchamkorea.org/flyer/Meeting/0412/images/speaker1.jpg",
            photoW: 88,
            photoH: 110,
            tag: "",
          },
        ],
      },
      {
        id: uid(),
        type: "session",
        time: "9:05am – 9:10am",
        title: "Welcoming Remarks",
        speakers: [
          {
            id: uid(),
            name: "TBD",
            title: "",
            org: "",
            photoUrl: "http://amchamkorea.org/flyer/2026/Meeting/0421 DBIK/Blank.PNG",
            photoW: 88,
            photoH: 110,
            tag: "",
          },
        ],
      },
      {
        id: uid(),
        type: "session",
        time: "9:10am – 9:15am",
        title: "Congratulatory Remarks",
        speakers: [
          {
            id: uid(),
            name: "TBD",
            title: "",
            org: "",
            photoUrl: "http://amchamkorea.org/flyer/2026/Meeting/0421 DBIK/Blank.PNG",
            photoW: 88,
            photoH: 110,
            tag: "",
          },
        ],
      },
      { id: uid(), type: "header", title: "Session 1." },
      {
        id: uid(),
        type: "session",
        time: "0:00am - 0:00am",
        title: "Presentation 1",
        speakers: [
          {
            id: uid(),
            name: "TBD",
            title: "",
            org: "",
            photoUrl: "http://amchamkorea.org/flyer/2026/Meeting/0421 DBIK/Blank.PNG",
            photoW: 88,
            photoH: 110,
            tag: "",
          },
        ],
      },
      {
        id: uid(),
        type: "simple",
        time: "0:00am - 0:00am",
        label: "Coffee & Networking Break",
        bold: true,
        highlight: false,
        centerLabel: true,
      },
      { id: uid(), type: "header", title: "Panel Discussion" },
      {
        id: uid(),
        type: "session",
        time: "0:00am - 0:00am",
        title: "Panel Discussion",
        speakers: [
          {
            id: uid(),
            name: "TBD",
            title: "",
            org: "",
            photoUrl: "http://amchamkorea.org/flyer/2026/Meeting/0421 DBIK/Blank.PNG",
            photoW: 88,
            photoH: 110,
            tag: "Moderator",
          },
          {
            id: uid(),
            name: "TBD",
            title: "",
            org: "",
            photoUrl: "http://amchamkorea.org/flyer/2026/Meeting/0421 DBIK/Blank.PNG",
            photoW: 88,
            photoH: 110,
            tag: "",
          },
          {
            id: uid(),
            name: "TBD",
            title: "",
            org: "",
            photoUrl: "http://amchamkorea.org/flyer/2026/Meeting/0421 DBIK/Blank.PNG",
            photoW: 88,
            photoH: 110,
            tag: "",
          },
        ],
      },
      {
        id: uid(),
        type: "simple",
        time: "0:00am – 0:00pm",
        label: "Q&A",
        bold: true,
        highlight: true,
        centerLabel: true,
      },
      {
        id: uid(),
        type: "simple",
        time: "12:00pm - 1:00pm",
        label: "Lunch & Closing",
        bold: true,
        highlight: true,
        centerLabel: true,
      },
    ],
  };
}

function buildSpeakerRow(sp) {
  const tagHtml = sp.tag
    ? `<strong><span style="color:red;"><i>${escapeHtml(
        sp.tag
      )}</i></span></strong><br />`
    : "";

  return `
<tr>
  <td style="border-top:1px solid #dddddd; padding:10px; background:#f6f6f6; font-size:10pt;">
    <table style="font-family: Arial; border-collapse:collapse;" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="${escapeHtml(sp.photoW || 88)}" valign="top">
          <img src="${escapeHtml(sp.photoUrl || "")}" width="${escapeHtml(
    sp.photoW || 88
  )}" height="${escapeHtml(
    sp.photoH || 110
  )}" alt="" style="display:block; border:0;" />
        </td>
        <td style="padding-left:15px; font-size:10pt;">
          ${tagHtml}<strong>${escapeHtml(sp.name || "")}</strong><br /><br />
          ${escapeHtml(sp.title || "")}<br />
          ${escapeHtml(sp.org || "")}
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function buildSessionBlockHtml(time, title, speakers) {
  const speakersHtml = (speakers || []).map(buildSpeakerRow).join("\n");
  return `
<tr style="font-size:11pt;">
  <td width="20%" align="center" style="background:#fff; border-top:1px solid #dddddd; border-right:1px solid #dddddd; padding:5px;">
    <strong>${escapeHtml(time || "")}</strong>
  </td>
  <td colspan="3" style="border-top:1px solid #dddddd; padding:0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; font-family: Arial;">
      <tr>
        <th colspan="4" align="left" height="35" style="font-size:10pt; padding-left:15px;">
          ${escapeHtml(title || "")}
        </th>
      </tr>
      ${speakersHtml}
    </table>
  </td>
</tr>`;
}

function buildHeaderBlockHtml(title) {
  return `
<tr>
  <th colspan="4" width="100%" align="center" height="45" style="background:#FEFBE9; border-top:1px solid #dddddd; color:#b90010; font-size:13pt;">
    ${escapeHtml(title || "")}
  </th>
</tr>`;
}

function buildSimpleBlockHtml({ time, label, bold, highlight, centerLabel }) {
  const leftStyle =
    "background:" +
    (highlight ? "#FEFBE9" : "#fff") +
    "; border-top:1px solid #dddddd; border-right:1px solid #dddddd; padding:10px; font-family:Arial;";

  const rightBase =
    "border-top:1px solid #dddddd; padding-left:15px;" +
    (centerLabel ? " text-align:center;" : "") +
    " font-size:10.5pt;";

  const rightStyle =
    "background:" + (highlight ? "#FEFBE9" : "#fff") + "; " + rightBase;

  const labelHtml = bold
    ? `<strong>${escapeHtml(label || "")}</strong>`
    : escapeHtml(label || "");

  return `
<tr style="font-size:11pt;">
  <td width="20%" align="center" style="${leftStyle}">
    <strong style="font-size:11pt;">${escapeHtml(time || "")}</strong>
  </td>
  <td colspan="3" align="left" style="${rightStyle}">
    ${labelHtml}
  </td>
</tr>`;
}

function buildTimetableHtml(state) {
  const blocksHtml = (state.blocks || [])
    .map((b) => {
      if (b.type === "header") return buildHeaderBlockHtml(b.title);
      if (b.type === "simple") return buildSimpleBlockHtml(b);
      if (b.type === "session") return buildSessionBlockHtml(b.time, b.title, b.speakers);
      return "";
    })
    .join("\n");

  return `
<table width="${escapeHtml(
    state.width
  )}" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:30px; color:#000; font-family:${escapeHtml(
    state.tableFont
  )};">
  <tr>
    <th colspan="4" width="100%" align="center" height="45" style="background:#FEFBE9; border-top:2px solid #263159; color:#b90010; font-size:13pt;">
      ${escapeHtml(state.timetableTitle)}
    </th>
  </tr>
  ${blocksHtml}
</table>`;
}

function buildFullEmailHtml(state) {
  const timetable = buildTimetableHtml(state);

  const FOOTER_HTML = `
<table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0"
       style="border-collapse:collapse; font-family: Arial; margin-top:20px;">
  <tr style="font-size:10pt; font-family: Arial;">
    <td align="center"
        style="padding-top:30px; padding-bottom:15px; padding-left:20px; padding-right:20px;">
      50F, Three IFC, 10, Gukjegeumyung-ro, Yeongdeungpo-gu, Seoul, Korea<br />
      © American Chamber of Commerce in Korea. All Rights Reserved.
    </td>
  </tr>
  <tr style="font-size:10pt;">
    <td align="center"
        style="padding-bottom:50px; padding-left:20px; padding-right:20px; border-bottom:2px solid #000;">
      <img src="https://www.amchamkorea.org/flyer/Meeting/images/buttons.jpg"
           alt="" width="96" height="26" usemap="#Map2"
           style="display:inline-block; border:0;" />
      <map name="Map2">
        <area shape="rect" coords="0,-2,26,24"
              href="https://www.facebook.com/amchamkorea" target="_blank" />
        <area shape="rect" coords="36,0,61,26"
              href="https://www.flickr.com/photos/amchamkorea/albums" target="_blank" />
        <area shape="rect" coords="70,0,96,26"
              href="https://www.youtube.com/channel/UCJzov9Tqs5FjHYye72WfiJA" target="_blank" />
      </map>
    </td>
  </tr>
</table>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>American Chamber of Commerce in Korea</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, sans-serif; color:#000;">
  <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0"
         style="border-collapse:collapse; margin:0 auto;">
    <tr>
      <td>
        <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0"
               style="border-collapse:collapse; margin-bottom:25px;">
          <tr>
            <td align="center" style="padding:0;">
              <img src="${escapeHtml(state.bannerUrl)}"
                   alt="" width="${escapeHtml(state.width)}" border="0"
                   style="display:block; outline:none; text-decoration:none; border:0;" />
            </td>
          </tr>
        </table>

        <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0"
               style="border-collapse:collapse; margin-top:50px;">
          <tr>
            <td width="400" valign="top" style="padding-right:15px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0"
                     style="border-collapse:collapse; color:#000; font-family: Arial;">
                <tr>
                  <th align="left" height="35"
                      style="background:#fff; padding-left:10px; color:#c11f2d; font-size:14pt;">
                    DATE &amp; TIME
                  </th>
                </tr>
                <tr>
                  <td valign="top" height="100"
                      style="border:2px solid #dddddd; padding:10px; line-height:1.4; font-size:12pt;">
                    <strong>${escapeHtml(state.dateLine)}</strong><br />
                    ${escapeHtml(state.timeLine)}
                  </td>
                </tr>
              </table>
            </td>

            <td width="400" valign="top">
              <table width="100%" border="0" cellspacing="0" cellpadding="0"
                     style="border-collapse:collapse; color:#000; font-family: Arial;">
                <tr>
                  <th align="left" height="35"
                      style="background:#fff; padding-left:10px; color:#c11f2d; font-size:14pt;">
                    VENUE
                  </th>
                </tr>
                <tr>
                  <td valign="top" height="100"
                      style="border:2px solid #dddddd; padding:10px; line-height:1.4; font-size:12pt;">
                    ${escapeHtml(state.venue)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0"
               style="border-collapse:collapse; margin-top:25px; color:#000; font-family: Arial;">
          <tr>
            <th align="left" height="35"
                style="background:#fff; padding-left:10px; color:#c11f2d; font-size:14pt;">
              TOPIC
            </th>
          </tr>
          <tr>
            <td valign="top" height="100"
                style="border:2px solid #dddddd; padding:10px; font-size:12pt;">
              ${safeHtml(state.topicHtml)}
            </td>
          </tr>
        </table>

        <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0"
               style="border-collapse:collapse; margin-top:25px; color:#000; font-family: Arial;">
          <tr>
            <th align="left" height="35"
                style="background:#fff; padding-left:10px; color:#c11f2d; font-size:14pt;">
              DESCRIPTION
            </th>
          </tr>
          <tr>
            <td valign="top" height="100"
                style="border:2px solid #dddddd; padding:10px; font-size:12pt;">
              ${escapeHtml(state.description)}
            </td>
          </tr>
        </table>

        <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0"
               style="border-collapse:collapse; margin-top:25px; color:#000; font-family: Arial;">
          <tr>
            <th align="left" height="35"
                style="background:#fff; padding-left:10px; color:#c11f2d; font-size:14pt;">
              COST
            </th>
          </tr>
          <tr>
            <td valign="top" height="100"
                style="border:2px solid #dddddd; padding:10px; line-height:1.5; font-size:12pt;">
              ${safeHtml(state.costHtml)}
            </td>
          </tr>
        </table>

        ${timetable}

        <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0"
               style="border-collapse:collapse; margin-top:20px; font-family: Arial;">
          <tr style="font-size:10pt;">
            <td colspan="4">
              <table width="100%" border="0" cellspacing="0" cellpadding="0"
                     style="border-collapse:collapse; border-top:2px solid #666; border-bottom:1px solid #d3d3d3;">
                <tr>
                  <th width="20%" align="left" height="35"
                      style="padding-left:15px; font-size:10pt; font-family:Arial;">
                    <strong>RSVP BY</strong>
                  </th>
                  <td colspan="3" align="left"
                      style="padding-left:15px; padding-top:15px; padding-bottom:15px; font-size:10pt; font-family:Arial;">
                    <strong>${escapeHtml(state.rsvpBy)}</strong><br />
                    ${safeHtml(state.rsvpNotesHtml)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr style="font-size:10pt;">
            <td colspan="4">
              <table width="100%" border="0" cellspacing="0" cellpadding="0"
                     style="border-collapse:collapse; border-bottom:1px solid #d3d3d3;">
                <tr>
                  <th width="20%" align="left" height="35"
                      style="padding-left:15px; font-size:10pt; font-family:Arial;">
                    <strong>CONTACT</strong>
                  </th>
                  <td colspan="3" align="left"
                      style="padding-left:15px; padding-top:15px; padding-bottom:15px; font-size:10pt; font-family:Arial;">
                    (email)
                    <a href="mailto:${escapeHtml(state.contactEmail)}"
                       style="color:#0066cc; text-decoration:underline;">
                      ${escapeHtml(state.contactEmail)}
                    </a>${state.contactPhone ? `<br />(phone) ${escapeHtml(state.contactPhone)}` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${FOOTER_HTML}
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildInteractiveSpeakerRow(blockId, sp) {
  const tagHtml = sp.tag
    ? `<strong><span style="color:red;"><i>${escapeHtml(
        sp.tag
      )}</i></span></strong><br />`
    : "";

  return `
<tr>
  <td style="border-top:1px solid #dddddd; padding:10px; background:#f6f6f6; font-size:10pt;">
    <table style="font-family: Arial; border-collapse:collapse;" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="${escapeHtml(sp.photoW || 88)}" valign="top">
          <img src="${escapeHtml(sp.photoUrl || "")}" width="${escapeHtml(
    sp.photoW || 88
  )}" height="${escapeHtml(
    sp.photoH || 110
  )}" alt="" style="display:block; border:0;" />
        </td>
        <td style="padding-left:15px; font-size:10pt;">
          ${tagHtml}<strong contenteditable="true" data-editable="true" data-kind="speaker" data-block-id="${escapeHtml(
            blockId
          )}" data-speaker-id="${escapeHtml(sp.id)}" data-field="name">${escapeHtml(
    sp.name || ""
  )}</strong><br /><br />
          <span contenteditable="true" data-editable="true" data-kind="speaker" data-block-id="${escapeHtml(
            blockId
          )}" data-speaker-id="${escapeHtml(sp.id)}" data-field="title">${escapeHtml(
    sp.title || ""
  )}</span><br />
          <span contenteditable="true" data-editable="true" data-kind="speaker" data-block-id="${escapeHtml(
            blockId
          )}" data-speaker-id="${escapeHtml(sp.id)}" data-field="org">${escapeHtml(
    sp.org || ""
  )}</span>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function buildInteractiveSessionBlockHtml(block) {
  const speakersHtml = (block.speakers || [])
    .map((sp) => buildInteractiveSpeakerRow(block.id, sp))
    .join("\n");

  return `
<tr style="font-size:11pt;">
  <td width="20%" align="center" style="background:#fff; border-top:1px solid #dddddd; border-right:1px solid #dddddd; padding:5px;">
    <strong>${escapeHtml(block.time || "")}</strong>
  </td>
  <td colspan="3" style="border-top:1px solid #dddddd; padding:0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; font-family: Arial;">
      <tr>
        <th colspan="4" align="left" height="35" style="font-size:10pt; padding-left:15px;">
          <span contenteditable="true" data-editable="true" data-kind="block" data-block-id="${escapeHtml(
            block.id
          )}" data-field="title">${escapeHtml(block.title || "")}</span>
        </th>
      </tr>
      ${speakersHtml}
    </table>
  </td>
</tr>`;
}

function buildInteractiveHeaderBlockHtml(block) {
  return `
<tr>
  <th colspan="4" width="100%" align="center" height="45" style="background:#FEFBE9; border-top:1px solid #dddddd; color:#b90010; font-size:13pt;">
    <span contenteditable="true" data-editable="true" data-kind="block" data-block-id="${escapeHtml(
      block.id
    )}" data-field="title">${escapeHtml(block.title || "")}</span>
  </th>
</tr>`;
}

function buildInteractiveTimetableHtml(state) {
  const blocksHtml = (state.blocks || [])
    .map((b) => {
      if (b.type === "header") return buildInteractiveHeaderBlockHtml(b);
      if (b.type === "simple") return buildSimpleBlockHtml(b);
      if (b.type === "session") return buildInteractiveSessionBlockHtml(b);
      return "";
    })
    .join("\n");

  return `
<table width="${escapeHtml(
    state.width
  )}" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:30px; color:#000; font-family:${escapeHtml(
    state.tableFont
  )};">
  <tr>
    <th colspan="4" width="100%" align="center" height="45" style="background:#FEFBE9; border-top:2px solid #263159; color:#b90010; font-size:13pt;">
      ${escapeHtml(state.timetableTitle)}
    </th>
  </tr>
  ${blocksHtml}
</table>`;
}

function parseHtmlToState(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const next = cloneDefault();
  const warnings = [];

  const firstImg = doc.querySelector('body > table img, table img');
  if (firstImg?.getAttribute("src")) next.bannerUrl = firstImg.getAttribute("src") || next.bannerUrl;

  const sectionBoxes = Array.from(doc.querySelectorAll("th")).reduce((acc, th) => {
    const label = (th.textContent || "").trim().toUpperCase();
    if (["DATE & TIME", "VENUE", "TOPIC", "DESCRIPTION", "COST", "RSVP BY", "CONTACT"].includes(label)) {
      acc[label] = th;
    }
    return acc;
  }, {});

  const dateTd = sectionBoxes["DATE & TIME"]?.closest("table")?.querySelectorAll("td")[0];
  if (dateTd) {
    const strong = dateTd.querySelector("strong");
    next.dateLine = (strong?.textContent || next.dateLine).trim();
    const fullText = (dateTd.textContent || "")
      .trim()
      .split(/\n|\r/)
      .map((v) => v.trim())
      .filter(Boolean);
    if (fullText.length > 1) next.timeLine = fullText.slice(1).join(" ");
  }

  const venueTd = sectionBoxes["VENUE"]?.closest("table")?.querySelectorAll("td")[0];
  if (venueTd) next.venue = (venueTd.textContent || next.venue).trim();

  const topicTd = sectionBoxes["TOPIC"]?.closest("table")?.querySelectorAll("td")[0];
  if (topicTd) next.topicHtml = topicTd.innerHTML.trim();

  const descTd = sectionBoxes["DESCRIPTION"]?.closest("table")?.querySelectorAll("td")[0];
  if (descTd) next.description = (descTd.textContent || next.description).trim();

  const costTd = sectionBoxes["COST"]?.closest("table")?.querySelectorAll("td")[0];
  if (costTd) next.costHtml = costTd.innerHTML.trim();

  const rsvpTd = sectionBoxes["RSVP BY"]?.parentElement?.querySelector("td");
  if (rsvpTd) {
    const rsvpStrong = rsvpTd.querySelector("strong");
    next.rsvpBy = (rsvpStrong?.textContent || next.rsvpBy).trim();
    const clone = rsvpTd.cloneNode(true);
    clone.querySelectorAll("strong").forEach((el) => el.remove());
    next.rsvpNotesHtml = clone.innerHTML.replace(/^\s*<br\s*\/?>/i, "").trim() || next.rsvpNotesHtml;
  }

  const contactTd = sectionBoxes["CONTACT"]?.parentElement?.querySelector("td");
  if (contactTd) {
    const mail = contactTd.querySelector('a[href^="mailto:"]');
    if (mail) next.contactEmail = (mail.textContent || next.contactEmail).trim();
    const txt = (contactTd.textContent || "").replace(/\s+/g, " ").trim();
    const phoneMatch = txt.match(/\(phone\)\s*(.+)$/i);
    next.contactPhone = phoneMatch ? phoneMatch[1].trim() : "";
  }

  const timetableRoot = Array.from(doc.querySelectorAll("table")).find((table) => {
    const firstTh = table.querySelector("tr > th");
    return firstTh && (firstTh.textContent || "").trim() === "Event Timetable";
  });

  if (timetableRoot) {
    const topTh = timetableRoot.querySelector("tr > th");
    next.timetableTitle = (topTh?.textContent || next.timetableTitle).trim();
    const rows = Array.from(timetableRoot.querySelectorAll(":scope > tbody > tr, :scope > tr")).slice(1);
    const blocks = [];

    rows.forEach((tr) => {
      const ths = tr.querySelectorAll(":scope > th");
      const tds = tr.querySelectorAll(":scope > td");

      if (ths.length === 1 && tds.length === 0) {
        blocks.push({
          id: uid(),
          type: "header",
          title: (ths[0].textContent || "").trim(),
        });
        return;
      }

      if (tds.length >= 2) {
        const time = (tds[0].textContent || "").trim();
        const secondTd = tds[1];
        const nestedTable = secondTd.querySelector("table");

        if (nestedTable) {
          const title = (nestedTable.querySelector("th")?.textContent || "").trim();
          const speakerRows = Array.from(nestedTable.querySelectorAll(":scope > tbody > tr, :scope > tr")).slice(1);

          const speakers = speakerRows.map((row) => {
            const img = row.querySelector("img");
            const tagNode = row.querySelector("span[style*='color:red']");
            const strongNodes = row.querySelectorAll("strong");
            const name = strongNodes.length
              ? (strongNodes[strongNodes.length - 1].textContent || "").trim()
              : "";

            const cell = row.querySelector("td td:last-child") || row.querySelector("td:last-child");
            let titleText = "";
            let orgText = "";

            if (cell) {
              const pieces = cell.innerHTML
                .replace(/<strong><span[^>]*>.*?<\/span><\/strong><br\s*\/?>?/i, "")
                .replace(/<strong>.*?<\/strong><br\s*\/?>?<br\s*\/?>?/i, "")
                .split(/<br\s*\/?>/i)
                .map((v) => textFromHtml(v))
                .filter(Boolean);

              titleText = pieces[0] || "";
              orgText = pieces[1] || "";
            }

            return {
              id: uid(),
              name: name || "TBD",
              title: titleText,
              org: orgText,
              photoUrl: img?.getAttribute("src") || "",
              photoW: Number(img?.getAttribute("width") || 88),
              photoH: Number(img?.getAttribute("height") || 110),
              tag: (tagNode?.textContent || "").trim(),
            };
          });

          blocks.push({
            id: uid(),
            type: "session",
            time,
            title,
            speakers: speakers.length
              ? speakers
              : [
                  {
                    id: uid(),
                    name: "TBD",
                    title: "",
                    org: "",
                    photoUrl: "",
                    photoW: 88,
                    photoH: 110,
                    tag: "",
                  },
                ],
          });
          return;
        }

        const label = (secondTd.textContent || "").trim();
        const align = secondTd.getAttribute("align") || "";
        const secondStyle = secondTd.getAttribute("style") || "";

        blocks.push({
          id: uid(),
          type: "simple",
          time,
          label,
          bold: !!secondTd.querySelector("strong"),
          highlight: /#FEFBE9/i.test((tds[0].getAttribute("style") || "") + secondStyle),
          centerLabel: /text-align\s*:\s*center/i.test(secondStyle) || align.toLowerCase() === "center",
        });
      }
    });

    if (blocks.length) next.blocks = blocks;
    else warnings.push("Timetable blocks could not be fully parsed, so the current template was kept.");
  } else {
    warnings.push("Event timetable table was not found, so the current timetable template was kept.");
  }

  return { state: next, warnings };
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    fontFamily: "Arial, sans-serif",
    color: "#0f172a",
  },
  shell: {
    maxWidth: 1780,
    margin: "0 auto",
    padding: 20,
    boxSizing: "border-box",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 14,
    color: "#475569",
  },
  topButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "320px 420px minmax(1100px, 1fr)",
    gap: 18,
    alignItems: "start",
  },
  card: {
    background: "#fff",
    border: "1px solid #dbe2ea",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
    marginBottom: 18,
  },
  cardHead: {
    padding: "14px 16px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
  },
  cardBody: {
    padding: 16,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 700,
  },
  fieldHint: {
    fontSize: 11,
    color: "#64748b",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
    background: "#fff",
    resize: "vertical",
  },
  button: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonDanger: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #dc2626",
    background: "#dc2626",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonGhost: {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  segmentedWrap: {
    display: "inline-flex",
    padding: 4,
    border: "1px solid #cbd5e1",
    borderRadius: 14,
    background: "#fff",
    gap: 4,
  },
  selectedSegment: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  normalSegment: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid transparent",
    background: "transparent",
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  listItem: {
    border: "1px solid #dbe2ea",
    borderRadius: 14,
    padding: 12,
    background: "#fff",
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  listItemSelected: {
    border: "2px solid #94a3b8",
    borderRadius: 14,
    padding: 11,
    background: "#fff",
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  blockTag: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    marginRight: 8,
  },
  hintBox: {
    border: "1px dashed #cbd5e1",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#475569",
    background: "#fff",
  },
  previewWrap: {
    overflowX: "auto",
  },
  smallText: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 1.5,
  },
  notice: {
    border: "1px solid #dbe2ea",
    borderRadius: 14,
    padding: 14,
    background: "#f8fafc",
    marginBottom: 12,
    fontSize: 13,
    color: "#475569",
  },
};

function Field({ label, children, hint }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabelRow}>
        <div style={styles.fieldLabel}>{label}</div>
        {hint ? <div style={styles.fieldHint}>{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Input(props) {
  return <input {...props} style={{ ...styles.input, ...(props.style || {}) }} />;
}

function TextArea(props) {
  return <textarea {...props} style={{ ...styles.textarea, ...(props.style || {}) }} />;
}

function Button({ children, onClick, danger = false, disabled = false, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(danger ? styles.buttonDanger : styles.button),
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, disabled = false, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.buttonGhost,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Card({ title, children, right }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHead}>
        <div style={styles.cardTitle}>{title}</div>
        {right}
      </div>
      <div style={styles.cardBody}>{children}</div>
    </div>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div style={styles.segmentedWrap}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={value === opt.value ? styles.selectedSegment : styles.normalSegment}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function InteractivePreview({ state, setState }) {
  const editableDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Interactive Email Preview</title>
  <style>
    body { margin:0; padding:24px; background:#f8fafc; font-family: Arial, sans-serif; color:#000; }
    .frame { width:${escapeHtml(state.width)}px; margin:0 auto; background:#fff; }
    [data-editable="true"] { outline: 1px dashed transparent; outline-offset: 2px; cursor: text; transition: outline-color .15s ease, background-color .15s ease; }
    [data-editable="true"]:hover { outline-color:#94a3b8; background:#f8fafc; }
    [data-editable="true"]:focus { outline:2px solid #334155; background:#fff; }
    .hint { width:${escapeHtml(state.width)}px; margin:0 auto 14px; color:#64748b; font-size:12px; }
  </style>
</head>
<body>
  <div class="hint">Click text in the preview to edit. Header titles, session titles, and speaker name/title/organization sync too.</div>
  <div class="frame">
    <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin:0 auto;">
      <tr>
        <td>
          <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-bottom:25px;">
            <tr>
              <td align="center" style="padding:0;">
                <img src="${escapeHtml(state.bannerUrl)}" alt="" width="${escapeHtml(
    state.width
  )}" border="0" style="display:block; outline:none; text-decoration:none; border:0;" />
              </td>
            </tr>
          </table>

          <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:50px;">
            <tr>
              <td width="400" valign="top" style="padding-right:15px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; color:#000; font-family: Arial;">
                  <tr>
                    <th align="left" height="35" style="background:#fff; padding-left:10px; color:#c11f2d; font-size:14pt;">DATE &amp; TIME</th>
                  </tr>
                  <tr>
                    <td valign="top" height="100" style="border:2px solid #dddddd; padding:10px; line-height:1.4; font-size:12pt;">
                      <strong contenteditable="true" data-editable="true" data-kind="field" data-field="dateLine">${escapeHtml(
                        state.dateLine
                      )}</strong><br />
                      <span contenteditable="true" data-editable="true" data-kind="field" data-field="timeLine">${escapeHtml(
                        state.timeLine
                      )}</span>
                    </td>
                  </tr>
                </table>
              </td>

              <td width="400" valign="top">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; color:#000; font-family: Arial;">
                  <tr>
                    <th align="left" height="35" style="background:#fff; padding-left:10px; color:#c11f2d; font-size:14pt;">VENUE</th>
                  </tr>
                  <tr>
                    <td valign="top" height="100" style="border:2px solid #dddddd; padding:10px; line-height:1.4; font-size:12pt;">
                      <div contenteditable="true" data-editable="true" data-kind="field" data-field="venue">${escapeHtml(
                        state.venue
                      )}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:25px; color:#000; font-family: Arial;">
            <tr>
              <th align="left" height="35" style="background:#fff; padding-left:10px; color:#c11f2d; font-size:14pt;">TOPIC</th>
            </tr>
            <tr>
              <td valign="top" height="100" style="border:2px solid #dddddd; padding:10px; font-size:12pt;">
                <div contenteditable="true" data-editable="true" data-kind="field" data-field="topicHtml" data-mode="html">${safeHtml(
                  state.topicHtml
                )}</div>
              </td>
            </tr>
          </table>

          <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:25px; color:#000; font-family: Arial;">
            <tr>
              <th align="left" height="35" style="background:#fff; padding-left:10px; color:#c11f2d; font-size:14pt;">DESCRIPTION</th>
            </tr>
            <tr>
              <td valign="top" height="100" style="border:2px solid #dddddd; padding:10px; font-size:12pt; white-space:pre-wrap;" contenteditable="true" data-editable="true" data-kind="field" data-field="description">${escapeHtml(
                state.description
              )}</td>
            </tr>
          </table>

          <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:25px; color:#000; font-family: Arial;">
            <tr>
              <th align="left" height="35" style="background:#fff; padding-left:10px; color:#c11f2d; font-size:14pt;">COST</th>
            </tr>
            <tr>
              <td valign="top" height="100" style="border:2px solid #dddddd; padding:10px; line-height:1.5; font-size:12pt;">
                <div contenteditable="true" data-editable="true" data-kind="field" data-field="costHtml" data-mode="html">${safeHtml(
                  state.costHtml
                )}</div>
              </td>
            </tr>
          </table>

          ${buildInteractiveTimetableHtml(state)}

          <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:20px; font-family: Arial;">
            <tr style="font-size:10pt;">
              <td colspan="4">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; border-top:2px solid #666; border-bottom:1px solid #d3d3d3;">
                  <tr>
                    <th width="20%" align="left" height="35" style="padding-left:15px; font-size:10pt; font-family:Arial;"><strong>RSVP BY</strong></th>
                    <td colspan="3" align="left" style="padding-left:15px; padding-top:15px; padding-bottom:15px; font-size:10pt; font-family:Arial;">
                      <strong contenteditable="true" data-editable="true" data-kind="field" data-field="rsvpBy">${escapeHtml(
                        state.rsvpBy
                      )}</strong><br />
                      <div contenteditable="true" data-editable="true" data-kind="field" data-field="rsvpNotesHtml" data-mode="html" style="display:inline-block; min-width:70%;">${safeHtml(
                        state.rsvpNotesHtml
                      )}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr style="font-size:10pt;">
              <td colspan="4">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; border-bottom:1px solid #d3d3d3;">
                  <tr>
                    <th width="20%" align="left" height="35" style="padding-left:15px; font-size:10pt; font-family:Arial;"><strong>CONTACT</strong></th>
                    <td colspan="3" align="left" style="padding-left:15px; padding-top:15px; padding-bottom:15px; font-size:10pt; font-family:Arial;">
                      (email)
                      <span contenteditable="true" data-editable="true" data-kind="field" data-field="contactEmail" style="color:#0066cc; text-decoration:underline;">${escapeHtml(
                        state.contactEmail
                      )}</span>
                      ${
                        state.contactPhone
                          ? `<br />(phone) <span contenteditable="true" data-editable="true" data-kind="field" data-field="contactPhone">${escapeHtml(
                              state.contactPhone
                            )}</span>`
                          : ""
                      }
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <table width="${escapeHtml(state.width)}" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; font-family: Arial; margin-top:20px;">
            <tr style="font-size:10pt; font-family: Arial;">
              <td align="center" style="padding-top:30px; padding-bottom:15px; padding-left:20px; padding-right:20px;">
                50F, Three IFC, 10, Gukjegeumyung-ro, Yeongdeungpo-gu, Seoul, Korea<br />
                © American Chamber of Commerce in Korea. All Rights Reserved.
              </td>
            </tr>
            <tr style="font-size:10pt;">
              <td align="center" style="padding-bottom:50px; padding-left:20px; padding-right:20px; border-bottom:2px solid #000;">
                <img src="https://www.amchamkorea.org/flyer/Meeting/images/buttons.jpg" alt="" width="96" height="26" usemap="#Map2" style="display:inline-block; border:0;" />
                <map name="Map2">
                  <area shape="rect" coords="0,-2,26,24" href="https://www.facebook.com/amchamkorea" target="_blank" />
                  <area shape="rect" coords="36,0,61,26" href="https://www.flickr.com/photos/amchamkorea/albums" target="_blank" />
                  <area shape="rect" coords="70,0,96,26" href="https://www.youtube.com/channel/UCJzov9Tqs5FjHYye72WfiJA" target="_blank" />
                </map>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>

  <script>
    const sendField = (field, value) => {
      parent.postMessage({ type: 'amcham-inline-edit', field, value }, '*');
    };

    const sendBlock = (blockId, field, value) => {
      parent.postMessage({ type: 'amcham-inline-block-edit', blockId, field, value }, '*');
    };

    const sendSpeaker = (blockId, speakerId, field, value) => {
      parent.postMessage({ type: 'amcham-inline-speaker-edit', blockId, speakerId, field, value }, '*');
    };

    const toPlain = (el) => el.innerText.replace(/\\u00A0/g, ' ').trim();
    const toHtml = (el) => el.innerHTML.trim();

    document.querySelectorAll('[data-editable="true"]').forEach((el) => {
      const field = el.dataset.field;
      const mode = el.dataset.mode || 'text';
      const kind = el.dataset.kind || 'field';
      const blockId = el.dataset.blockId;
      const speakerId = el.dataset.speakerId;

      el.addEventListener('input', () => {
        const value = mode === 'html' ? toHtml(el) : toPlain(el);
        if (kind === 'speaker') {
          sendSpeaker(blockId, speakerId, field, value);
        } else if (kind === 'block') {
          sendBlock(blockId, field, value);
        } else {
          sendField(field, value);
        }
      });
    });
  </script>
</body>
</html>`;

  useEffect(() => {
    const onMessage = (event) => {
      const data = event?.data;
      if (!data) return;

      if (data.type === "amcham-inline-edit" && data.field) {
        setState((s) => ({ ...s, [data.field]: data.value }));
        return;
      }

      if (data.type === "amcham-inline-block-edit" && data.blockId && data.field) {
        setState((s) => ({
          ...s,
          blocks: (s.blocks || []).map((b) =>
            b.id === data.blockId ? { ...b, [data.field]: data.value } : b
          ),
        }));
        return;
      }

      if (
        data.type === "amcham-inline-speaker-edit" &&
        data.blockId &&
        data.speakerId &&
        data.field
      ) {
        setState((s) => ({
          ...s,
          blocks: (s.blocks || []).map((b) =>
            b.id !== data.blockId
              ? b
              : {
                  ...b,
                  speakers: (b.speakers || []).map((sp) =>
                    sp.id === data.speakerId ? { ...sp, [data.field]: data.value } : sp
                  ),
                }
          ),
        }));
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setState]);

  return (
    <div>
      <div style={styles.notice}>
        Click directly on the text inside the preview to edit. Header titles, session titles, and speaker name/title/organization sync too.
      </div>
      <div style={styles.previewWrap}>
        <iframe
          title="interactive-preview"
          style={{
            width: "100%",
            minWidth: 1100,
            height: 1260,
            border: "1px solid #cbd5e1",
            borderRadius: 12,
            background: "#fff",
          }}
          sandbox="allow-scripts"
          srcDoc={editableDoc}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : cloneDefault();
  });
  const [selectedBlockId, setSelectedBlockId] = useState(state.blocks[0]?.id || null);
  const [previewMode, setPreviewMode] = useState("interactive");
  const [importHtmlText, setImportHtmlText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!state.blocks.some((b) => b.id === selectedBlockId)) {
      setSelectedBlockId(state.blocks[0]?.id || null);
    }
  }, [state.blocks, selectedBlockId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const selectedBlock = state.blocks.find((b) => b.id === selectedBlockId) || null;

  const timetableHtml = useMemo(() => buildTimetableHtml(state).trim(), [state]);
  const fullEmailHtml = useMemo(() => buildFullEmailHtml(state).trim(), [state]);

  const setField = (field, value) => {
    setState((s) => ({ ...s, [field]: value }));
  };

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatusMessage(`${label} copied.`);
    } catch {
      alert("Copy failed. You can manually select and copy from the textarea.");
    }
  };

  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    const next = cloneDefault();
    setState(next);
    setSelectedBlockId(next.blocks[0]?.id || null);
    setStatusMessage("Reset to the baseline template.");
  };

  const addBlock = (type) => {
    const block =
      type === "header"
        ? { id: uid(), type: "header", title: "New Header" }
        : type === "simple"
        ? {
            id: uid(),
            type: "simple",
            time: "",
            label: "New Row",
            bold: false,
            highlight: false,
            centerLabel: false,
          }
        : {
            id: uid(),
            type: "session",
            time: "",
            title: "New Session",
            speakers: [
              {
                id: uid(),
                name: "New Speaker",
                title: "Title",
                org: "Organization",
                photoUrl: "http://amchamkorea.org/flyer/2026/Meeting/0421 DBIK/Blank.PNG",
                photoW: 88,
                photoH: 110,
                tag: "",
              },
            ],
          };

    setState((s) => ({ ...s, blocks: [...s.blocks, block] }));
    setSelectedBlockId(block.id);
  };

  const deleteBlock = (id) => {
    setState((s) => ({ ...s, blocks: s.blocks.filter((b) => b.id !== id) }));
  };

  const moveBlock = (id, dir) => {
    setState((s) => {
      const i = s.blocks.findIndex((b) => b.id === id);
      const j = dir === "up" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= s.blocks.length) return s;
      const arr = [...s.blocks];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...s, blocks: arr };
    });
  };

  const updateBlock = (patch) => {
    if (!selectedBlockId) return;
    setState((s) => ({
      ...s,
      blocks: s.blocks.map((b) =>
        b.id === selectedBlockId ? { ...b, ...patch } : b
      ),
    }));
  };

  const addSpeaker = () => {
    if (!selectedBlock || selectedBlock.type !== "session") return;
    const sp = {
      id: uid(),
      name: "New Speaker",
      title: "Title",
      org: "Organization",
      photoUrl: "http://amchamkorea.org/flyer/2026/Meeting/0421 DBIK/Blank.PNG",
      photoW: 88,
      photoH: 110,
      tag: "",
    };
    updateBlock({ speakers: [...(selectedBlock.speakers || []), sp] });
  };

  const deleteSpeaker = (speakerId) => {
    if (!selectedBlock || selectedBlock.type !== "session") return;
    updateBlock({
      speakers: (selectedBlock.speakers || []).filter((s) => s.id !== speakerId),
    });
  };

  const moveSpeaker = (speakerId, dir) => {
    if (!selectedBlock || selectedBlock.type !== "session") return;
    const arr = [...(selectedBlock.speakers || [])];
    const i = arr.findIndex((s) => s.id === speakerId);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    updateBlock({ speakers: arr });
  };

  const updateSpeaker = (speakerId, patch) => {
    if (!selectedBlock || selectedBlock.type !== "session") return;
    updateBlock({
      speakers: (selectedBlock.speakers || []).map((s) =>
        s.id === speakerId ? { ...s, ...patch } : s
      ),
    });
  };

  const importHtml = () => {
    try {
      if (!importHtmlText.trim()) {
        alert("Paste HTML first.");
        return;
      }
      const result = parseHtmlToState(importHtmlText);
      setState(result.state);
      setSelectedBlockId(result.state.blocks[0]?.id || null);
      setStatusMessage(
        result.warnings.length
          ? `Imported with notes: ${result.warnings.join(" ")}`
          : "HTML imported successfully."
      );
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
  };

  const exportJson = () => {
    const txt = JSON.stringify(state, null, 2);
    setJsonText(txt);
    copy(txt, "JSON backup");
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || !Array.isArray(parsed.blocks)) {
        throw new Error("Invalid JSON format.");
      }
      const next = {
        ...cloneDefault(),
        ...parsed,
        blocks: (parsed.blocks || []).map((b) => ({
          ...b,
          id: b.id || uid(),
          speakers: (b.speakers || []).map((sp) => ({
            photoW: 88,
            photoH: 110,
            tag: "",
            ...sp,
            id: sp.id || uid(),
          })),
        })),
      };
      setState(next);
      setSelectedBlockId(next.blocks[0]?.id || null);
      setStatusMessage("JSON imported successfully.");
    } catch (err) {
      alert(`JSON import failed: ${err.message}`);
    }
  };

  const gridTwo = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topBar}>
          <div>
            <div style={styles.headerTitle}>AMCHAM Full Email Editor</div>
            <div style={styles.headerSub}>
              Edit event info, manage timetable blocks, import modified HTML, and update text directly in the preview.
            </div>
          </div>
          <div style={styles.topButtons}>
            <GhostButton onClick={() => copy(timetableHtml, "Timetable HTML")}>
              Copy Timetable
            </GhostButton>
            <Button onClick={() => copy(fullEmailHtml, "Full Email HTML")}>
              Copy Full Email
            </Button>
            <Button danger onClick={resetToDefault}>Reset</Button>
          </div>
        </div>

        {statusMessage ? <div style={{ ...styles.notice, marginBottom: 18 }}>{statusMessage}</div> : null}

        <div style={styles.layout}>
          <div>
            <Card title="Import / Export">
              <Field label="Paste modified HTML" hint="Bring an externally edited HTML back into the editor">
                <TextArea
                  rows={12}
                  value={importHtmlText}
                  onChange={(e) => setImportHtmlText(e.target.value)}
                />
              </Field>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <Button onClick={importHtml}>Import HTML</Button>
                <GhostButton onClick={() => setImportHtmlText("")}>Clear</GhostButton>
              </div>
              <div style={{ ...styles.smallText, marginBottom: 16 }}>
                Best results come from HTML that follows this editor’s table structure. If the structure changed a lot, some parts may stay on the current template.
              </div>

              <Field label="JSON backup" hint="Most reliable save/restore format">
                <TextArea
                  rows={10}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                />
              </Field>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button onClick={exportJson}>Export JSON</Button>
                <GhostButton onClick={importJson}>Import JSON</GhostButton>
                <GhostButton onClick={() => setJsonText("")}>Clear</GhostButton>
              </div>
            </Card>

            <Card title="Event Info">
              <Field label="Banner image URL">
                <Input
                  value={state.bannerUrl}
                  onChange={(e) => setField("bannerUrl", e.target.value)}
                />
              </Field>

              <div style={gridTwo}>
                <Field label="Date line" hint="Shown in bold">
                  <Input
                    value={state.dateLine}
                    onChange={(e) => setField("dateLine", e.target.value)}
                  />
                </Field>
                <Field label="Time line">
                  <Input
                    value={state.timeLine}
                    onChange={(e) => setField("timeLine", e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Venue">
                <Input
                  value={state.venue}
                  onChange={(e) => setField("venue", e.target.value)}
                />
              </Field>

              <Field label="Topic" hint="HTML allowed: <br>">
                <TextArea
                  rows={4}
                  value={state.topicHtml}
                  onChange={(e) => setField("topicHtml", e.target.value)}
                />
              </Field>

              <Field label="Description" hint="Plain text">
                <TextArea
                  rows={4}
                  value={state.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </Field>

              <Field label="Cost" hint="HTML allowed: <br>">
                <TextArea
                  rows={3}
                  value={state.costHtml}
                  onChange={(e) => setField("costHtml", e.target.value)}
                />
              </Field>

              <div style={gridTwo}>
                <Field label="RSVP by">
                  <Input
                    value={state.rsvpBy}
                    onChange={(e) => setField("rsvpBy", e.target.value)}
                  />
                </Field>
                <Field label="Contact phone">
                  <Input
                    value={state.contactPhone}
                    onChange={(e) => setField("contactPhone", e.target.value)}
                  />
                </Field>
              </div>

              <Field label="RSVP notes" hint="HTML allowed: <br>">
                <TextArea
                  rows={3}
                  value={state.rsvpNotesHtml}
                  onChange={(e) => setField("rsvpNotesHtml", e.target.value)}
                />
              </Field>

              <Field label="Contact email">
                <Input
                  value={state.contactEmail}
                  onChange={(e) => setField("contactEmail", e.target.value)}
                />
              </Field>
            </Card>

            <Card
              title="Timetable Sections"
              right={
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button onClick={() => addBlock("header")}>+ Header</Button>
                  <Button onClick={() => addBlock("simple")}>+ Row</Button>
                  <Button onClick={() => addBlock("session")}>+ Session</Button>
                </div>
              }
            >
              {state.blocks.map((b, idx) => {
                const typeLabel =
                  b.type === "header" ? "Header" : b.type === "simple" ? "Row" : "Session";

                const subtitle =
                  b.type === "header"
                    ? ""
                    : b.type === "simple"
                    ? `${b.time || "(no time)"} · ${b.label}`
                    : `${b.time || "(no time)"} · ${(b.speakers || []).length} speakers`;

                const tagStyle =
                  b.type === "header"
                    ? { ...styles.blockTag, background: "#fef3c7", color: "#92400e" }
                    : b.type === "simple"
                    ? { ...styles.blockTag, background: "#e2e8f0", color: "#334155" }
                    : { ...styles.blockTag, background: "#dbeafe", color: "#1d4ed8" };

                return (
                  <div
                    key={b.id}
                    style={b.id === selectedBlockId ? styles.listItemSelected : styles.listItem}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedBlockId(b.id)}
                      style={{
                        flex: 1,
                        textAlign: "left",
                        background: "transparent",
                        border: 0,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ marginBottom: 4 }}>
                        <span style={tagStyle}>{typeLabel}</span>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {b.type === "header" ? b.title : b.type === "simple" ? b.label : b.title}
                        </span>
                      </div>
                      {subtitle ? <div style={{ fontSize: 12, color: "#64748b" }}>{subtitle}</div> : null}
                    </button>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <GhostButton disabled={idx === 0} onClick={() => moveBlock(b.id, "up")}>↑</GhostButton>
                      <GhostButton disabled={idx === state.blocks.length - 1} onClick={() => moveBlock(b.id, "down")}>↓</GhostButton>
                      <Button danger onClick={() => deleteBlock(b.id)}>Delete</Button>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>

          <div>
            <Card title="Section Editor">
              {!selectedBlock ? (
                <div style={styles.hintBox}>Select a section on the left, or add a new one.</div>
              ) : (
                <div>
                  <div style={{ ...styles.fieldLabelRow, marginBottom: 14 }}>
                    <div style={styles.fieldLabel}>Type</div>
                    <Segmented
                      value={selectedBlock.type}
                      onChange={(t) => {
                        if (t === selectedBlock.type) return;
                        if (t === "header") {
                          updateBlock({ type: "header", title: selectedBlock.title || selectedBlock.label || "New Header" });
                        } else if (t === "simple") {
                          updateBlock({
                            type: "simple",
                            time: selectedBlock.time || "",
                            label: selectedBlock.title || selectedBlock.label || "New Row",
                            bold: !!selectedBlock.bold,
                            highlight: !!selectedBlock.highlight,
                            centerLabel: !!selectedBlock.centerLabel,
                          });
                        } else {
                          updateBlock({
                            type: "session",
                            time: selectedBlock.time || "",
                            title: selectedBlock.title || selectedBlock.label || "New Session",
                            speakers:
                              selectedBlock.speakers || [
                                {
                                  id: uid(),
                                  name: "New Speaker",
                                  title: "Title",
                                  org: "Organization",
                                  photoUrl: "http://amchamkorea.org/flyer/2026/Meeting/0421 DBIK/Blank.PNG",
                                  photoW: 88,
                                  photoH: 110,
                                  tag: "",
                                },
                              ],
                          });
                        }
                      }}
                      options={[
                        { value: "header", label: "Header" },
                        { value: "simple", label: "Row" },
                        { value: "session", label: "Session" },
                      ]}
                    />
                  </div>

                  {selectedBlock.type === "header" ? (
                    <Field label="Header title">
                      <Input value={selectedBlock.title} onChange={(e) => updateBlock({ title: e.target.value })} />
                    </Field>
                  ) : null}

                  {selectedBlock.type === "simple" ? (
                    <div>
                      <Field label="Time">
                        <Input value={selectedBlock.time} onChange={(e) => updateBlock({ time: e.target.value })} />
                      </Field>
                      <Field label="Label">
                        <Input value={selectedBlock.label} onChange={(e) => updateBlock({ label: e.target.value })} />
                      </Field>
                      <Field label="Style">
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <label style={{ fontSize: 14 }}><input type="checkbox" checked={!!selectedBlock.bold} onChange={(e) => updateBlock({ bold: e.target.checked })} style={{ marginRight: 8 }} />Bold</label>
                          <label style={{ fontSize: 14 }}><input type="checkbox" checked={!!selectedBlock.highlight} onChange={(e) => updateBlock({ highlight: e.target.checked })} style={{ marginRight: 8 }} />Highlight</label>
                          <label style={{ fontSize: 14 }}><input type="checkbox" checked={!!selectedBlock.centerLabel} onChange={(e) => updateBlock({ centerLabel: e.target.checked })} style={{ marginRight: 8 }} />Center label</label>
                        </div>
                      </Field>
                    </div>
                  ) : null}

                  {selectedBlock.type === "session" ? (
                    <div>
                      <Field label="Time">
                        <Input value={selectedBlock.time} onChange={(e) => updateBlock({ time: e.target.value })} />
                      </Field>
                      <Field label="Session title">
                        <Input value={selectedBlock.title} onChange={(e) => updateBlock({ title: e.target.value })} />
                      </Field>

                      <div style={{ ...styles.fieldLabelRow, marginBottom: 10 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Speakers</div>
                        <Button onClick={addSpeaker}>+ Add Speaker</Button>
                      </div>

                      {(selectedBlock.speakers || []).length === 0 ? (
                        <div style={styles.hintBox}>No speakers yet. Click Add Speaker.</div>
                      ) : null}

                      {(selectedBlock.speakers || []).map((sp, idx) => (
                        <div
                          key={sp.id}
                          style={{
                            border: "1px solid #dbe2ea",
                            borderRadius: 14,
                            background: "#fff",
                            padding: 12,
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 12,
                              marginBottom: 12,
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{sp.name || "(no name)"}</div>
                              <div style={{ fontSize: 12, color: "#64748b" }}>{sp.title || ""} {sp.title && sp.org ? "·" : ""} {sp.org || ""}</div>
                              {sp.tag ? <div style={{ fontSize: 11, color: "#be123c", marginTop: 4 }}>{sp.tag}</div> : null}
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <GhostButton disabled={idx === 0} onClick={() => moveSpeaker(sp.id, "up")}>↑</GhostButton>
                              <GhostButton disabled={idx === (selectedBlock.speakers || []).length - 1} onClick={() => moveSpeaker(sp.id, "down")}>↓</GhostButton>
                              <Button danger onClick={() => deleteSpeaker(sp.id)}>Delete</Button>
                            </div>
                          </div>

                          <Field label="Tag (optional: Moderator)">
                            <Input value={sp.tag || ""} onChange={(e) => updateSpeaker(sp.id, { tag: e.target.value })} />
                          </Field>
                          <Field label="Name">
                            <Input value={sp.name || ""} onChange={(e) => updateSpeaker(sp.id, { name: e.target.value })} />
                          </Field>
                          <Field label="Title">
                            <Input value={sp.title || ""} onChange={(e) => updateSpeaker(sp.id, { title: e.target.value })} />
                          </Field>
                          <Field label="Organization">
                            <Input value={sp.org || ""} onChange={(e) => updateSpeaker(sp.id, { org: e.target.value })} />
                          </Field>
                          <Field label="Photo URL">
                            <Input value={sp.photoUrl || ""} onChange={(e) => updateSpeaker(sp.id, { photoUrl: e.target.value })} />
                          </Field>
                          <div style={gridTwo}>
                            <Field label="Photo width">
                              <Input type="number" value={sp.photoW || 88} onChange={(e) => updateSpeaker(sp.id, { photoW: Number(e.target.value || 88) })} />
                            </Field>
                            <Field label="Photo height">
                              <Input type="number" value={sp.photoH || 110} onChange={(e) => updateSpeaker(sp.id, { photoH: Number(e.target.value || 110) })} />
                            </Field>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </Card>

            <Card title="Exported HTML">
              <Field label="Timetable only">
                <TextArea value={timetableHtml} readOnly rows={10} />
              </Field>
              <Field label="Full email">
                <TextArea value={fullEmailHtml} readOnly rows={14} />
              </Field>
            </Card>
          </div>

          <div>
            <Card
              title="Live Preview (Full Email)"
              right={
                <Segmented
                  value={previewMode}
                  onChange={setPreviewMode}
                  options={[
                    { value: "interactive", label: "Quick Edit" },
                    { value: "rendered", label: "Rendered" },
                  ]}
                />
              }
            >
              {previewMode === "interactive" ? (
                <InteractivePreview state={state} setState={setState} />
              ) : (
                <div style={styles.previewWrap}>
                  <iframe
                    title="preview"
                    style={{
                      width: "100%",
                      minWidth: 1100,
                      height: 1100,
                      border: "1px solid #cbd5e1",
                      borderRadius: 12,
                      background: "#fff",
                    }}
                    sandbox=""
                    srcDoc={fullEmailHtml}
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}