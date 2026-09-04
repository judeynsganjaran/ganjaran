const express = require('express');
const router = express.Router();
const { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun, WidthType } = require('docx');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Group = require('../models/Group');

function cell(text, bold = false) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: String(text), bold })] })],
    width: { size: 25, type: WidthType.PERCENTAGE }
  });
}

router.get('/word', async (req, res) => {
  try {
    const classes = await Class.find().sort({ name: 1 });
    const sections = [];

    sections.push(
      new Paragraph({
        text: 'Backup Data Sistem Ganjaran Bahasa Melayu',
        heading: HeadingLevel.TITLE
      }),
      new Paragraph({
        text: `Tarikh eksport: ${new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}`
      }),
      new Paragraph({ text: '' })
    );

    for (const cls of classes) {
      const students = await Student.find({ classId: cls._id }).sort({ points: -1 });
      const groups = await Group.find({ classId: cls._id }).populate('members').populate('leaderId');

      sections.push(new Paragraph({ text: `Kelas: ${cls.name}`, heading: HeadingLevel.HEADING_1 }));

      // Jadual Murid
      sections.push(new Paragraph({ text: 'Senarai Murid & Bintang', heading: HeadingLevel.HEADING_2 }));
      if (students.length === 0) {
        sections.push(new Paragraph({ text: 'Tiada murid.' }));
      } else {
        sections.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [cell('Nama Murid', true), cell('Bilangan Bintang', true)] }),
            ...students.map((s) => new TableRow({ children: [cell(s.name), cell(s.points)] }))
          ]
        }));
      }
      sections.push(new Paragraph({ text: '' }));

      // Jadual Kumpulan
      sections.push(new Paragraph({ text: 'Senarai Kumpulan', heading: HeadingLevel.HEADING_2 }));
      if (groups.length === 0) {
        sections.push(new Paragraph({ text: 'Tiada kumpulan.' }));
      } else {
        sections.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [cell('Kumpulan', true), cell('Ketua', true), cell('Ahli', true), cell('Jumlah Bintang', true)] }),
            ...groups.map((g) => {
              const memberPoints = g.members.reduce((sum, m) => sum + (m.points || 0), 0);
              const total = memberPoints + (g.bonusPoints || 0);
              const leaderName = g.leaderId ? g.leaderId.name : '-';
              const memberNames = g.members.map((m) => m.name).join(', ') || '-';
              return new TableRow({ children: [cell(g.name), cell(leaderName), cell(memberNames), cell(total)] });
            })
          ]
        }));
      }
      sections.push(new Paragraph({ text: '' }), new Paragraph({ text: '' }));
    }

    const doc = new Document({
      sections: [{ children: sections }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `backup-ganjaran-bm-${new Date().toISOString().slice(0, 10)}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
