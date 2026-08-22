"""
AyurSaarthi Ayurveda Clinical Knowledge Base
Used by Groq Intent Router for medical query augmentation.
"""

AYURVEDA_KNOWLEDGE_BASE = """
# AyurSaarthi Ayurveda Clinical Knowledge Base

## Tridosha Framework
- **Vata** (Air + Space): Controls movement, nerve signals, breathing, circulation. Imbalance → pain, dryness, anxiety, constipation, joint cracking.
- **Pitta** (Fire + Water): Controls digestion, metabolism, intelligence, body temperature. Imbalance → acidity, inflammation, skin rashes, anger, fever.
- **Kapha** (Earth + Water): Controls structure, immunity, lubrication. Imbalance → weight gain, congestion, lethargy, mucus, diabetes risk.

## Common Conditions & Dosha Mapping
| Condition | Dosha | Symptoms |
|---|---|---|
| Amlapitta (GERD/Acidity) | Pitta↑ | Burning stomach, acid reflux, sour belching, nausea |
| Sandhivata (Osteoarthritis) | Vata↑ | Joint pain, crepitus, morning stiffness, swelling |
| Madhumeha (Diabetes T2) | Kapha+Pitta | Frequent urination, thirst, fatigue, slow wound healing |
| Shirahshool (Headache/Migraine) | Vata/Pitta | Throbbing headache, light sensitivity, nausea |
| Shvasa (Asthma/Respiratory) | Kapha+Vata | Breathlessness, wheezing, mucus, night worsening |
| Arsha (Piles/Hemorrhoids) | Vata/Pitta | Rectal pain, bleeding, constipation |
| Katigraha (Backache/Sciatica) | Vata↑ | Lower back pain, radiation to leg, numbness |
| Pandu (Anemia) | Pitta+Kapha | Pallor, fatigue, breathlessness, palpitation |
| Kasa (Chronic Cough) | Kapha/Vata | Persistent cough, dry or productive |
| Atisara (Diarrhea/IBS) | Vata/Pitta | Loose stools, cramps, urgency |

## Ashtavidha Pariksha (8-Point Examination)
1. **Nadi** (Pulse): Vata=snake-like; Pitta=frog-like; Kapha=swan-like
2. **Mutra** (Urine): Color, frequency, foaminess
3. **Mala** (Stool): Consistency, color, frequency
4. **Jihva** (Tongue): Coating type, color, tremors
5. **Shabda** (Voice): Hoarseness indicates Vata/Kapha
6. **Sparsha** (Touch/Skin): Dryness=Vata; Heat=Pitta; Cold+Oily=Kapha
7. **Drik** (Eyes): Clarity, color of conjunctiva
8. **Akruti** (Build): Body constitution

## Prakriti Types
- **Vata Prakriti**: Thin, dry skin, creative, anxious, variable digestion, light sleep
- **Pitta Prakriti**: Medium build, sharp intellect, competitive, strong digestion, prone to anger
- **Kapha Prakriti**: Heavy build, calm, slow digestion, strong immunity, prone to lethargy

## Key Ayurvedic Medicines & Indications
| Medicine | Indication | Form |
|---|---|---|
| Yograj Guggulu | Vata disorders, arthritis, joint pain | Tablet |
| Triphala Churna | Digestive tonic, constipation, detox | Powder |
| Ashwagandha (Withania) | Stress, fatigue, immunity, muscle weakness | Tablet/Churna |
| Brahmi Vati | Memory, anxiety, neurological disorders | Tablet |
| Chandraprabha Vati | UTI, diabetes, urinary disorders | Tablet |
| Avipattikar Churna | Hyperacidity, GERD, constipation | Powder |
| Dashamoola Kwath | Vata disorders, sciatica, backache | Decoction |
| Punarnavadi Mandura | Anemia, edema, liver disorders | Tablet |
| Chyawanprash | Immunity, respiratory health, rejuvenation | Lehyam |
| Kanchanar Guggulu | Thyroid, lymph nodes, PCOS | Tablet |

## Pathya (Beneficial) Foods by Dosha
- **Vata**: Warm, oily, heavy foods. Ghee, sesame, dairy, root vegetables, cooked grains.
- **Pitta**: Cool, sweet, bitter foods. Coconut, coriander, mint, sweet fruits, leafy greens.
- **Kapha**: Light, dry, spicy foods. Ginger, turmeric, honey, legumes, bitter vegetables.

## Apathya (Harmful) Foods by Dosha
- **Vata**: Cold, raw, dry foods. Crackers, beans, raw salads, cold drinks.
- **Pitta**: Spicy, sour, fermented foods. Chili, vinegar, alcohol, processed foods.
- **Kapha**: Heavy, oily, sweet foods. Dairy excess, wheat, sugar, fried foods.

## Panchakarma Therapies
- **Vamana**: Therapeutic emesis for Kapha disorders
- **Virechana**: Purgation for Pitta disorders
- **Basti**: Medicated enema for Vata disorders (most important)
- **Nasya**: Nasal medication for head/neck conditions
- **Raktamokshana**: Blood letting for skin/blood disorders

## Emergency Red Flags (Refer to Modern Medicine Immediately)
- Chest pain + breathlessness → Cardiac Emergency
- Sudden severe headache + vision change → Stroke
- High fever >104°F + neck stiffness → Meningitis
- Severe abdominal pain + vomiting blood → GI Emergency
- Unconsciousness / unresponsiveness → Emergency Dispatch / MedRoute
"""
