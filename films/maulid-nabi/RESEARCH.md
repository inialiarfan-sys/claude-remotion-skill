# Research and reference checklist

This is the fact-check record for *The Birth of the Beloved Prophet Muhammad ﷺ*. Every claim shown on screen is listed below. Each entry gives its source, how it was checked, and how the film presents it.

**Status key**

- **Established**: Qur'an text, or an authentic hadith in a canonical collection. Shown as fact.
- **Widely held / historical**: The mainstream position of the sirah literature. Shown as historical framing, with no stronger claim.
- **Disputed report**: Recorded in historical works, but its authenticity is questioned. Always shown with the disclaimer *SEKADAR GAMBARAN BERDASARKAN RIWAYAT SEJARAH*.

## Research environment limitations

The build container's network policy blocked direct access to sunnah.com, quran.com, islamqa.info, shamela.ws, islamweb.net and wikisource. The research therefore relied on:

- the Uthmani Qur'an text from **The Noble Qur'an Encyclopedia (quranenc.com)**, packaged on npm as `quran-json@3.x`. The verse was extracted from the dataset and compared codepoint by codepoint;
- web-search results that index those sites. The film depends on search snippets only for the existence and location of reports, never for an authenticity verdict.

Where a detail could not be checked against a primary text, this file says so, and the film does not state it.

---

## 1. Qur'an, Al-Anbiya' 21:107 (Scenes 6 and 7)

| Field | Record |
|---|---|
| Claim | "وَمَآ أَرْسَلْنَٰكَ إِلَّا رَحْمَةً لِّلْعَٰلَمِينَ" |
| Source | Qur'an 21:107. The text comes from quranenc.com via `quran-json` (`dist/quran.json`, surah 21, verse 107). |
| Verification | The verse was extracted programmatically. The dataset uses KFGQPC-specific mark codepoints: U+06E1 for sukun and U+0657 for the tanwin of رَحۡمَةٗ. In Amiri those render as a small head of khah and an inverted damma. They were mapped to the standard Unicode marks U+0652 (sukun) and U+064B (fathatan), which matches Tanzil's Uthmani encoding. Letters, vowels, shadda, maddah and dagger alif are unchanged. The rendering was checked visually in the output frames. |
| Malay | "Dan tidaklah Kami mengutuskan engkau (wahai Muhammad), melainkan untuk menjadi rahmat bagi sekalian alam." This is the wording supplied in the brief. It matches the meaning of the Indonesian Ministry of Religious Affairs translation in the same dataset: "Dan Kami tidak mengutus engkau (Muhammad) melainkan untuk (menjadi) rahmat bagi seluruh alam." |
| Status | **Established** |

## 2. Hadith, Sahih Muslim 1162 (Scene 7)

| Field | Record |
|---|---|
| Claim | The Prophet ﷺ was asked about fasting on Monday and said it was the day he was born. |
| Source | Sahih Muslim, *Kitab al-Siyam*, hadith of Abu Qatadah al-Ansari. Number 1162 in Muhammad Fu'ad 'Abd al-Baqi's numbering. |
| Arabic shown (verbatim matn of the relevant passage) | وَسُئِلَ عَنْ صَوْمِ يَوْمِ الِاثْنَيْنِ، قَالَ: «ذَاكَ يَوْمٌ وُلِدْتُ فِيهِ، وَيَوْمٌ بُعِثْتُ - أَوْ أُنْزِلَ عَلَيَّ - فِيهِ» |
| Correction to the brief | The brief's Arabic, «سُئِلَ رَسُولُ اللَّهِ ﷺ … فَقَالَ: ذَاكَ يَوْمٌ وُلِدْتُ فِيهِ», paraphrases the opening and stops partway through the Prophet's ﷺ answer. The film quotes the actual wording of the passage instead, including «وَيَوْمٌ بُعِثْتُ - أَوْ أُنْزِلَ عَلَيَّ - فِيهِ». The narrator's doubt, "or: revelation was sent down to me", is part of the hadith. The Malay rendering names Rasulullah ﷺ for clarity, since the Arabic passage is the middle of a longer narration. |
| Verification | Search results from sites indexing sunnah.com and hadith databases (e.g. surahquran.com Hadith-40105, hadithanswers.com, islamqa.info/ar/answers/137931) give the same wording and the reference *Muslim 1162*. sunnah.com itself was unreachable from the container. Before publishing, compare against a printed Sahih Muslim or sunnah.com/muslim:1162a. |
| Malay | "Rasulullah ﷺ ditanya tentang puasa hari Isnin. Baginda menjawab: 'Itulah hari aku dilahirkan, dan hari aku diutus (menjadi Rasul) — atau diturunkan wahyu kepadaku.'" |
| Status | **Established** (authentic, in Sahih Muslim) |

## 3. Birth in Makkah, in the Year of the Elephant (Scene 2)

| Field | Record |
|---|---|
| Claim | Text cards "مَكَّةُ الْمُكَرَّمَةُ / Makkah al-Mukarramah" and "عَامُ الْفِيلِ / Tahun Gajah". |
| Source | The mainstream sirah position, beginning with Ibn Ishaq as transmitted by Ibn Hisham. A report from Qays ibn Makhramah, recalled as being in Jami' al-Tirmidhi but not verified in this session, says he and the Prophet ﷺ were born in the Year of the Elephant. Other years were also proposed in the early literature. |
| How it is shown | Two place/time cards and nothing more. The film shows no elephant, army or attack on the Ka'bah, and does not suggest that any event of that year happened on the night of the birth. It gives no Gregorian year and no day of the month, because both are disputed. |
| Not verified here | The exact Tirmidhi hadith number and its grading. These are deliberately absent from the film. |
| Status | **Widely held / historical** |

## 4. The shaking of Kisra's palace and the fall of its balconies (Scene 4)

| Field | Record |
|---|---|
| Claim (as reported) | On the night of the birth the iwan of Kisra shook (ارتجس) and fourteen of its *shurufat* (crenellations) fell. |
| Earliest traceable sources | Al-Khara'iti, *Hawatif al-Jinan*. Al-Bayhaqi, *Dala'il al-Nubuwwah*, vol. 1, in the chapter باب ما جاء في ارتجاس إيوان كسرى وسقوط شرفه وغير ذلك (the chapter title appears on islamweb.net's library listing). Also cited in later works, including Ibn Kathir, *al-Bidayah wa al-Nihayah*, vol. 2 (chapter ذكر ارتجاس إيوان كسرى، وسقوط الشرفات), with search results also attributing versions to Ibn Abi al-Dunya and Ibn 'Asakir. Those two attributions were not checked against the books themselves. |
| Chain | Through **Makhzum ibn Hani' al-Makhzumi, from his father**. The father is described in the report as having lived to 150 years. The same narration includes the dream of the Mobedhan and the story of 'Abd al-Masih and Satih. |
| Scholarly assessment | Secondary sources attribute to al-Dhahabi the verdict «منكر غريب» (*munkar gharib*, an objectionable, isolated report). Critics also point to unknown narrators in the chain. A counter-view, e.g. an article by Rabitat al-'Ulama' al-Suriyyin, argues that rejecting such sirah reports outright is not required. **These verdicts could not be checked against al-Dhahabi's text from this container**, so the film quotes no verdict. |
| How it is shown | The film shows a restrained tremor and **four** decorative merlons falling, not fourteen. The palace is not destroyed. The disclaimer stays on screen for about 10 seconds, and the scene does not suggest an authenticated hadith. |
| Status | **Disputed report** |

## 5. The Persian sacred fire going out (Scene 5)

| Field | Record |
|---|---|
| Claim (as reported) | The fire of Persia went out (خمدت نار فارس), and the report adds that it had not gone out for a thousand years. |
| Sources and chain | The same narration as item 4: Makhzum ibn Hani' from his father, in al-Khara'iti, al-Bayhaqi's *Dala'il*, and later works such as Ibn Kathir's *al-Bidayah*. |
| Scholarly assessment | As item 4. It is the same report, with the same disputed status. |
| How it is shown | A stylised flame on a fire altar dies down and goes out, and its smoke rises. There is no explosion or destruction, and the "thousand years" detail is left out. The disclaimer stays on screen for about 8 seconds. |
| Status | **Disputed report** |

## 6. Scene 3: the house

The film shows only the exterior of an ancient Makkan house, lit by ordinary oil lamps. It does **not** depict the Prophet ﷺ in any form: no face, figure, silhouette, infant or point-of-view shot. It does not present the light as a miracle. Reports of a light seen at the birth exist in the sirah literature but are not depicted. The architecture is a respectful approximation of 6th-century Hijazi building (mud brick, palm-trunk joists, palm-frond awning), not a claim about the actual house.

## 7. Architecture of the Persian scenes

- The palace is modelled on the **Taq Kasra (Iwan of Khosrow) at Ctesiphon**: a single parabolic brick vault, a façade with tiers of blind arcades, and stepped Sasanian merlons. It is stylised, not a measured reconstruction.
- The fire sanctuary is a generic Sasanian-style fire temple interior, with a pointed niche and a stepped fire altar (*atashdan*). The film does not name a specific temple.

## Claims that still need checking before publication

1. **Sahih Muslim 1162 wording.** Compare against sunnah.com or a printed edition. It was confirmed only through indexed copies.
2. **Al-Dhahabi's verdict on the Makhzum ibn Hani' report.** Locate it in *Tarikh al-Islam* (sirah volume) or *al-Sirah al-Nabawiyyah*. It is attributed only through secondary sources.
3. **Exact volume and page numbers** in al-Bayhaqi's *Dala'il al-Nubuwwah*, al-Khara'iti's *Hawatif al-Jinan* and Ibn Kathir's *al-Bidayah*. These are deliberately omitted from the film, which says so on screen.
4. **Tirmidhi's Qays ibn Makhramah report** on the Year of the Elephant: hadith number and grading. Not shown in the film.

## Search sources consulted

- quranenc.com Uthmani text via the npm package [`quran-json`](https://github.com/risan/quran-json)
- https://surahquran.com/Hadith-40105.html
- https://hadithanswers.com/?p=18955
- https://islamqa.info/ar/answers/137931
- https://islamqa.info/ar/answers/287632
- https://www.islamweb.net/ar/library/content/1005/39/ (al-Bayhaqi, *Dala'il al-Nubuwwah*, chapter on ارتجاس إيوان كسرى)
- https://ar.wikisource.org/wiki/البداية_والنهاية/الجزء_الثاني/ذكر_ارتجاس_إيوان_كسرى،_وسقوط_الشرفات
- https://shamela.ws/book/20824/191 (chapter heading only)
- https://islamsyria.com/articles/جراءة-منكورة-على-بعض-مرويات-السيرة (the counter-view)
