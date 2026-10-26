# Bab 1 — research and reference checklist

*Perjalanan Hidup Rasulullah SAW*, Chapter 1: **Zaman Kanak-kanak hingga Menjelang Baligh**. Each on-screen claim is listed below with its basis and how it is presented.

**Status key**

- **Established**: Qur'an, or an authentic hadith.
- **Sirah (mainstream)**: The standard account of the classical sirah: Ibn Ishaq as transmitted by Ibn Hisham, followed by later works such as *al-Raheeq al-Makhtum*. It is shown as sirah and labelled where needed.
- **Report**: A specific narration with discussion about its chain. It is shown with a label.
- **Illustrative**: Artistic or visual framing only. Labelled "ilustrasi".

The same environment limits as `RESEARCH.md` apply. Primary-text websites were blocked, so hadith numbers marked *(recalled)* must be checked before publication. Qur'anic text was taken programmatically from the quranenc.com Uthmani dataset (`quran-json`) and is stored in `src/chapter1/verses.ts`. A script check confirms the strings are identical to the source after the documented mark normalisation (U+06E1 → U+0652, U+0657 → U+064B).

## Depiction rules applied

The Prophet ﷺ is never shown as a figure, face, body, silhouette, shadow, infant, child or youth. He is represented only by his name in calligraphy and text, and by places, objects (an empty cradle, a balance scale), maps and changing light. No human figures appear at all. Camels and sheep are the only living beings. No conversations, expressions or actions are invented.

## Claims by scene

| Scene | On screen | Basis | Status |
|---|---|---|---|
| 1 | سِيرَةُ النَّبِيِّ مُحَمَّدٍ ﷺ / PERJALANAN HIDUP RASULULLAH SAW / BAB 1 | Title | — |
| 1 | Map of Arabia: Makkah, Yathrib, Syam, Yaman | Approximate coastlines. The map is labelled as a stylised manuscript map in code. | Illustrative |
| 2 | Ka'bah in the valley of Makkah | The Ka'bah stood in Makkah before the Prophet's ﷺ birth (cf. Qur'an 3:96, 14:37). It is drawn as a plain dark stone block without later ornament. Its exact 6th-century form is not claimed. | Established / illustrative form |
| 2 | Ibunda: Aminah binti Wahb; Ayahanda: Abdullah bin Abdul Muttalib | Lineage given by all sirah sources (Ibn Ishaq/Ibn Hisham). | Sirah (mainstream) |
| 2 | Abdullah "Wafat sebelum Baginda lahir", plus the gloss *"Menurut riwayat sirah yang masyhur"* | The majority sirah view (Ibn Ishaq). A minority view places his death a few months after the birth, which is why the gloss is shown. | Sirah (mainstream), labelled |
| 2 | RASULULLAH SAW DILAHIRKAN SEBAGAI ANAK YATIM, plus أَلَمْ يَجِدْكَ يَتِيمًا فَـَٔاوَىٰ (Ad-Duha 93:6) | Qur'an 93:6 states that he ﷺ was an orphan. The Malay rendering, "Bukankah Dia mendapatimu yatim, lalu Dia melindungimu?", follows the meaning of the Indonesian Ministry translation in the dataset. | Established |
| 3 | Zaman kanak-kanak bersama Halimah al-Sa'diyah; "Halimah, ibu susuan Baginda"; Bani Sa'd | Sirah (Ibn Ishaq): his wet-nurse was Halimah bint Abi Dhu'ayb of Banu Sa'd ibn Bakr. The route and region on the map are marked **"(ANGGARAN)"**, meaning approximate. No age is given for his return to Makkah because sources differ. | Sirah (mainstream); map position approximate |
| 3 | Tents, flock, camels, a day–night cycle | Generic Bedouin environment, labelled *"Ilustrasi suasana — bukan gambaran peristiwa sebenar"*. | Illustrative |
| 4 | Route Yathrib → al-Abwa'; USIA 6 TAHUN; IBUNDA BAGINDA, AMINAH BINTI WAHB, WAFAT. | Sirah (Ibn Ishaq): Aminah took him to visit his maternal relatives in Yathrib and died at al-Abwa' on the way back, when he was six. Sahih Muslim records the Prophet ﷺ visiting his mother's grave; it does not give the place (*recalled*, no. 976). The scene shows only a resting caravan at dusk, with no death scene and no figures. Labelled *"Menurut riwayat sirah · ilustrasi suasana"*. | Sirah (mainstream), labelled |
| 4–5 | DIJAGA OLEH DATUKNYA, ABDUL MUTTALIB; USIA 8 TAHUN; ABDUL MUTTALIB WAFAT. | Sirah (Ibn Ishaq): Abdul Muttalib looked after him and died when he was eight. The sirah literature reports this age consistently. | Sirah (mainstream) |
| 5 | BAGINDA KEMUDIAN DIJAGA OLEH BAPA SAUDARANYA, ABU TALIB. | Sirah (Ibn Ishaq). Abu Talib was the full brother of Abdullah. | Sirah (mainstream) |
| 5 | Family tree: guardianship shown as gold dotted arrows, passing from Aminah to Abdul Muttalib to Abu Talib | Diagram of the facts above. Only these five names appear; no other relatives are implied. | Diagram |
| 6 | MAKKAH: PUSAT PERDAGANGAN DAN PERSINGGAHAN KAFILAH, plus Qur'an 106:2 إِۦلَٰفِهِمْ رِحْلَةَ ٱلشِّتَآءِ وَٱلصَّيْفِ | Qur'an 106:1–2 refers to the winter and summer journeys of Quraysh. The map shows routes to Syam and Yaman, but the film does **not** assign a season to either route, since that pairing comes from tafsir. | Established (verse); routes illustrative |
| 6 | *"Menurut riwayat sirah, Baginda pernah mengikuti kafilah Abu Talib ke Syam."*, plus the gloss *"Riwayat al-Tirmidhi dan kitab-kitab sirah · tiada butiran tambahan dipaparkan"* | This is the journey with Abu Talib to al-Sham, reported in Sunan al-Tirmidhi (hadith of Abu Musa al-Ash'ari, *recalled* no. 3620, graded *hasan gharib* by al-Tirmidhi) and in the sirah works. Critics have questioned parts of the text, such as the mention of Abu Bakr and Bilal. **The film shows no age, no monk (Bahira) and no incident**, only the fact of the journey, labelled as a report. | Report, labelled |
| 7 | USIA 9 / 10 / 11 / 12 TAHUN, plus *"Penanda usia ini ilustrasi peredaran masa"* | Illustrative year markers only, as the brief required. **No event is attached to any of these ages.** | Illustrative |
| 7 | *"Baginda pernah mengembala kambing untuk penduduk Makkah."*, plus the gloss *"Sahih al-Bukhari · usia tidak dinyatakan dalam riwayat"* | Sahih al-Bukhari, Kitab al-Ijarah, hadith of Abu Hurairah: «كُنْتُ أَرْعَاهَا عَلَى قَرَارِيطَ لِأَهْلِ مَكَّةَ» (*recalled*, no. 2262). The hadith gives no age, and the gloss says so. The caption appears only after the age markers have finished. | Established |
| 8 | الأَمِينُ; AL-AMIN — GELARAN YANG DIKENALI DALAM SIRAH BAGINDA., plus the gloss *"Sirah Ibn Hisham (riwayat Ibn Ishaq) · tiada usia khusus dinyatakan"* | Ibn Ishaq (Ibn Hisham) reports that Quraysh called him *al-Amin* before prophethood. It is famously cited in the account of the Ka'bah rebuilding, when they said «هَذَا الأَمِينُ». **No age is given for when the title began.** | Sirah (mainstream), sourced on screen |
| 8 | Balance scale; caravans; trade route; *"Laluan kafilah merentasi Jazirah Arab"* | Symbolic: the scale stands for honesty in trade. | Illustrative |
| 8 | PERJALANAN HIDUP BAGINDA BERTERUSAN MENUJU ALAM DEWASA. | Transition caption. No age is given for puberty. | — |
| 9 | 6 TAHUN — KEHILANGAN IBUNDA; 8 TAHUN — KEHILANGAN DATUK; DI BAWAH JAGAAN ABU TALIB; ZAMAN KANAK-KANAK MENUJU ALAM DEWASA; BERSAMBUNG…; BAB 2 — ZAMAN REMAJA DAN MENJELANG KERASULAN | A summary of the above. | — |

## Things to check before publication

1. **Sahih al-Bukhari 2262** (shepherding): confirm the number. The caption shows only "Sahih al-Bukhari".
2. **Sunan al-Tirmidhi 3620** (journey to al-Sham with Abu Talib): confirm the number and al-Tirmidhi's grading. The caption shows only "Riwayat al-Tirmidhi".
3. **Sahih Muslim 976** (visit to his mother's grave): background only, not shown on screen.
4. **The al-Amin report** in Ibn Hisham: confirm the chapter on the rebuilding of the Ka'bah.
5. **The location of Banu Sa'd's lands** is approximate and labelled so. Confirm it against a historical atlas if more precision is wanted.

## Not included, deliberately

- The splitting of the chest (*shaqq al-sadr*) during the Banu Sa'd years. It is authentic (Sahih Muslim), but showing it would require depicting the Prophet ﷺ as a child.
- The monk Bahira and any dialogue from the Syam journey, which the brief asked to avoid.
- Specific ages for the return from Banu Sa'd, the Syam journey, shepherding, puberty, or the title al-Amin.
