package com.agricare.service;

import com.agricare.entity.*;
import com.agricare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializerService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CropRepository cropRepository;
    private final DiseaseRepository diseaseRepository;
    private final TreatmentRepository treatmentRepository;
    private final MarketPriceRepository marketPriceRepository;
    private final BuyerRepository buyerRepository;
    private final FpoRepository fpoRepository;
    private final ColdStorageRepository coldStorageRepository;
    private final LogisticsProviderRepository logisticsProviderRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final ProduceListingRepository produceListingRepository;
    private final ProduceOrderRepository produceOrderRepository;
    private final StorageBookingRepository storageBookingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding realistic agricultural demo data into BFarm database...");
            seedUsers();
            seedCrops();
            seedDiseasesAndTreatments();
            seedMarketPrices();
            seedBuyers();
            seedFpos();
            seedColdStorage();
            seedLogisticsProviders();
            seedInitialDiagnoses();
            log.info("BFarm database initialized successfully with comprehensive demo data.");
        }
        seedRbacAndMarketplaceData();
    }

    private void seedUsers() {
        // Demo Farmer
        userRepository.save(User.builder()
                .name("Ramesh Kumar (Demo Farmer)")
                .phone("9876543210")
                .password(passwordEncoder.encode("farmer123"))
                .role(User.Role.FARMER)
                .language("te")
                .state("Andhra Pradesh")
                .district("Guntur")
                .village("Tenali")
                .build());

        // Demo Admin
        userRepository.save(User.builder()
                .name("AgriCare Admin (Demo)")
                .phone("9999999999")
                .password(passwordEncoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .language("en")
                .state("Andhra Pradesh")
                .district("Guntur")
                .village("Amaravati")
                .build());
    }

    private void seedCrops() {
        cropRepository.saveAll(List.of(
                Crop.builder().name("Tomato").localNameTelugu("టమోటా").localNameHindi("टमाटर").category("Vegetables").icon("🍅").build(),
                Crop.builder().name("Rice").localNameTelugu("వరి / ధాన్యం").localNameHindi("चावल / धान").category("Cereals").icon("🌾").build(),
                Crop.builder().name("Chilli").localNameTelugu("మిరప").localNameHindi("मिर्च").category("Spices").icon("🌶️").build(),
                Crop.builder().name("Cotton").localNameTelugu("పత్తి").localNameHindi("कपास").category("Fiber").icon("☁️").build(),
                Crop.builder().name("Maize").localNameTelugu("మొక్కజొన్న").localNameHindi("मक्का").category("Cereals").icon("🌽").build(),
                Crop.builder().name("Groundnut").localNameTelugu("వేరుశనగ").localNameHindi("मूंगफली").category("Oilseeds").icon("🥜").build(),
                Crop.builder().name("Potato").localNameTelugu("బంగాళాదుంప").localNameHindi("आलू").category("Tubers").icon("🥔").build()
        ));
    }

    private void seedDiseasesAndTreatments() {
        // 1. Tomato Early Blight
        Disease tomatoEarlyBlight = diseaseRepository.save(Disease.builder()
                .name("Early Blight")
                .crop("Tomato")
                .severity("Medium")
                .symptoms("Brown to dark brown concentric rings (target board pattern) on lower leaves, surrounded by a yellow halo.")
                .prevention("Maintain proper plant spacing (45-60 cm), avoid overhead sprinkler irrigation, practice crop rotation with non-solanaceous crops.")
                .treatmentSummary("Remove infected lower foliage. Spray copper oxychloride or approved organic neem formulations.")
                .build());

        // English Treatment
        treatmentRepository.save(Treatment.builder()
                .diseaseId(tomatoEarlyBlight.getId())
                .language("en")
                .title("Early Blight Treatment Guide")
                .steps("[\"1. Remove and destroy heavily infected lower leaves to prevent fungal spore splash.\", \"2. Ensure adequate spacing (45-60 cm) between plants for air circulation.\", \"3. Water at the base of plants; avoid wetting leaves.\", \"4. Mulch around the plant base with clean straw to create a soil barrier.\", \"5. Apply copper-based fungicide or neem seed kernel extract (5%) as per local extension label.\"]")
                .prevention("• Practice 2-year crop rotation\n• Inspect field weekly after heavy rains\n• Keep field clean of fallen debris")
                .warning("⚠️ Important: Follow locally approved agricultural guidance and product labels before using any pesticide or chemical treatment.")
                .build());

        // Telugu Treatment (తెలుగు)
        treatmentRepository.save(Treatment.builder()
                .diseaseId(tomatoEarlyBlight.getId())
                .language("te")
                .title("టమోటా ముందస్తు తెగులు (ఎర్లీ బ్లైట్) నివారణ మార్గదర్శకం")
                .steps("[\"1. తెగులు సోకిన దిగువ ఆకులను తుంచి పొలం బయట కాల్చివేయండి లేదా పాతిపెట్టండి.\", \"2. మొక్కల మధ్య గాలి వెలుతురు ప్రసరించేందుకు తగిన దూరం (45-60 సెం.మీ) పాటించండి.\", \"3. మొక్కల మొదళ్ల వద్ద మాత్రమే నీరు పెట్టండి; ఆకులపై నీరు చిలకరించవద్దు.\", \"4. తేమ నేల ద్వారా తెగులు వ్యాపించకుండా మొదళ్ల వద్ద ఎండుగడ్డితో మల్చింగ్ చేయండి.\", \"5. స్థానిక వ్యవసాయ అధికారి లేదా KVK సూచించిన కాపర్ ఆక్సీక్లోరైడ్ లేదా వేప నూనెను పిచికారీ చేయండి.\"]")
                .prevention("• పంట మార్పిడి పద్ధతి పాటించండి\n• అధిక తేమ సమయాల్లో క్రమం తప్పకుండా ఆకులను పరిశీలించండి\n• పొలంలో పాత పంట అవశేషాలను తొలగించండి")
                .warning("⚠️ ముఖ్య గమనిక: ఏదైనా రసాయన పురుగుమందు వాడే ముందు తప్పనిసరిగా వ్యవసాయ శాస్త్రవేత్త లేదా KVK నిపుణుల సలహా తీసుకోండి.")
                .build());

        // Hindi Treatment (हिंदी)
        treatmentRepository.save(Treatment.builder()
                .diseaseId(tomatoEarlyBlight.getId())
                .language("hi")
                .title("टमाटर अगेती झुलसा (अर्ली ब्लाइट) उपचार गाइड")
                .steps("[\"1. रोगग्रस्त निचली पत्तियों को तुरंत तोड़कर खेत से दूर नष्ट कर दें।\", \"2. पौधों के बीच 45 से 60 सेमी की उचित दूरी बनाए रखें ताकि हवा का प्रवाह बना रहे।\", \"3. पौधों की जड़ों में पानी दें; पत्तियों पर छिड़काव से बचें।\", \"4. मिट्टी की नमी रोकने के लिए पौधों के चारों ओर पुआल की मल्चिंग करें।\", \"5. स्थानीय कृषि विज्ञान केंद्र (KVK) द्वारा अनुमोदित कॉपर ऑक्सीक्लोराइड या 5% नीम अर्क का छिड़काव करें।\"]")
                .prevention("• कम से कम 2 साल का फसल चक्र अपनाएं\n• बारिश के बाद नियमित रूप से पत्तियों की जांच करें\n• खेत को खरपतवार और पुराने अवशेषों से साफ रखें")
                .warning("⚠️ महत्वपूर्ण: किसी भी कीटनाशक या रासायनिक दवा का उपयोग करने से पहले स्थानीय कृषि विभाग की सिफारिशों और लेबल निर्देशों का पालन करें।")
                .build());

        // 2. Tomato Late Blight
        Disease tomatoLateBlight = diseaseRepository.save(Disease.builder()
                .name("Late Blight")
                .crop("Tomato")
                .severity("High")
                .symptoms("Large water-soaked irregular lesions with white cottony fungal growth underneath during cool moist weather.")
                .prevention("Use certified resistant seeds, destroy volunteer crops, ensure good drainage.")
                .treatmentSummary("Remove blighted vines immediately. Apply Mancozeb or metalaxyl as recommended.")
                .build());

        treatmentRepository.save(Treatment.builder()
                .diseaseId(tomatoLateBlight.getId())
                .language("en")
                .title("Late Blight Management Plan")
                .steps("[\"1. Rogue out severely damaged plants immediately.\", \"2. Ensure field has excellent drainage to prevent waterlogging.\", \"3. Apply approved protective fungicide before forecasted cool rain.\", \"4. Disinfect farming tools after working in affected areas.\"]")
                .prevention("• Plant certified disease-free seedlings\n• Avoid sprinkler irrigation\n• Monitor daily in cool foggy mornings")
                .warning("⚠️ Important: Follow locally approved agricultural guidance before using any chemical.")
                .build());

        treatmentRepository.save(Treatment.builder()
                .diseaseId(tomatoLateBlight.getId())
                .language("te")
                .title("టమోటా లేట్ బ్లైట్ నివారణ మార్గదర్శకం")
                .steps("[\"1. తీవ్రంగా పాడైన మొక్కలను వెంటనే తొలగించి దూరంగా కాల్చండి.\", \"2. పొలంలో నీరు నిలవకుండా కాలువలు ఏర్పాటు చేయండి.\", \"3. వర్షపు రోజులకు ముందు సిఫార్సు చేసిన రక్షిత శిలీంద్రనాశిని వాడండి.\", \"4. వ్యవసాయ పరికరాలను శుభ్రంగా ఉంచుకోండి.\"]")
                .prevention("• ఆరోగ్యకరమైన ధృవీకరించిన విత్తనాలు వాడండి\n• మంచు ఎక్కువగా ఉండే ఉదయాల్లో నిశితంగా గమనించండి")
                .warning("⚠️ ముఖ్య గమనిక: ఏదైనా రసాయనం వాడే ముందు స్థానిక వ్యవసాయ నిపుణుల సలహా తీసుకోండి.")
                .build());

        treatmentRepository.save(Treatment.builder()
                .diseaseId(tomatoLateBlight.getId())
                .language("hi")
                .title("टमाटर पछेती झुलसा प्रबंधन")
                .steps("[\"1. गंभीर रूप से संक्रमित पौधों को तुरंत उखाड़कर नष्ट करें।\", \"2. खेत में जलभराव न होने दें; जल निकासी की व्यवस्था करें।\", \"3. मौसम खराब होने पर अनुमोदित फफूंदनाशी का छिड़काव करें।\"]")
                .prevention("• प्रमाणित रोगमुक्त पौधे लगाएं\n• ड्रिप सिंचाई का उपयोग करें")
                .warning("⚠️ महत्वपूर्ण: स्थानीय कृषि अधिकारी से परामर्श के बाद ही कीटनाशक का उपयोग करें।")
                .build());

        // 3. Rice Leaf Blast
        Disease riceBlast = diseaseRepository.save(Disease.builder()
                .name("Leaf Blast")
                .crop("Rice")
                .severity("High")
                .symptoms("Spindle-shaped or diamond-shaped lesions with grayish centers and brown borders on leaves.")
                .prevention("Avoid excessive nitrogen fertilizer application, treat seeds before sowing.")
                .treatmentSummary("Apply Tricyclazole 75% WP or Pseudomonas fluorescens as per package of practices.")
                .build());

        treatmentRepository.save(Treatment.builder()
                .diseaseId(riceBlast.getId())
                .language("en")
                .title("Rice Leaf Blast Treatment")
                .steps("[\"1. Split nitrogen fertilizer into 3-4 doses; avoid single heavy dose.\", \"2. Maintain a shallow layer of water in the paddy field.\", \"3. Spray Tricyclazole 75% WP @ 0.6g/L or bio-agent Pseudomonas.\"]")
                .prevention("• Use blast-tolerant paddy varieties\n• Seed treatment with Carbendazim (2g/kg)")
                .warning("⚠️ Important: Follow recommended dosage strictly to prevent chemical runoff.")
                .build());

        treatmentRepository.save(Treatment.builder()
                .diseaseId(riceBlast.getId())
                .language("te")
                .title("వరి ఆకు అగ్గితెగులు నివారణ పద్ధతులు")
                .steps("[\"1. యూరియా (నత్రజని) ఎరువును ఒకేసారి వేయకుండా 3-4 దఫాలుగా వేయండి.\", \"2. పొలంలో నీటిని ఎల్లప్పుడూ తగినంత స్థాయిలో ఉంచండి.\", \"3. లీటరు నీటికి 0.6 గ్రా. ట్రైసైక్లాజోల్ 75% WP కలిపి పిచికారీ చేయండి.\"]")
                .prevention("• అగ్గితెగులు తట్టుకునే రకాలను ఎంచుకోండి\n• విత్తన శుద్ధి తప్పనిసరిగా చేయండి")
                .warning("⚠️ ముఖ్య గమనిక: మోతాదుకు మించి రసాయనాలు వాడవద్దు.")
                .build());

        treatmentRepository.save(Treatment.builder()
                .diseaseId(riceBlast.getId())
                .language("hi")
                .title("धान का झोंका (ब्लास्ट) रोग नियंत्रण")
                .steps("[\"1. यूरिया की अत्यधिक मात्रा से बचें, 3-4 बार में दें।\", \"2. खेत में उचित नमी बनाए रखें।\", \"3. ट्राईसाइक्लाजोल 75% WP का छिड़काव करें।\"]")
                .prevention("• प्रमाणित रोगरोधी किस्मों की बुवाई करें\n• बुवाई से पहले बीजोपचार करें")
                .warning("⚠️ महत्वपूर्ण: अनुमोदित मात्रा का ही उपयोग करें।")
                .build());

        // 4. Chilli Leaf Curl
        Disease chilliLeafCurl = diseaseRepository.save(Disease.builder()
                .name("Leaf Curl")
                .crop("Chilli")
                .severity("Medium")
                .symptoms("Upward curling of leaf margins, puckering, stunted bushy appearance caused by thrips and whiteflies.")
                .prevention("Install yellow and blue sticky traps (10-15 per acre), raise border crops of maize/sorghum.")
                .treatmentSummary("Spray systemic insecticide for vector management alongside neem oil 10,000 ppm.")
                .build());

        treatmentRepository.save(Treatment.builder()
                .diseaseId(chilliLeafCurl.getId())
                .language("te")
                .title("మిరప బొబ్బర / ఆకుముడత తెగులు నివారణ")
                .steps("[\"1. ఎకరానికి 15-20 పసుపు, నీలి రంగు జిగురు అట్టలను అమర్చండి.\", \"2. పొలం గట్ల చుట్టూ 4 వరుసల మొక్కజొన్న లేదా జొన్నను రక్షక పంటగా వేయండి.\", \"3. తెల్లదోమ, తామర పురుగుల నివారణకు వేపనూనె లేదా సిఫార్సు చేసిన పురుగుమందు పిచికారీ చేయండి.\"]")
                .prevention("• వేసవిలో లోతు దుక్కులు దున్నండి\n• ఆశించిన మొక్కలను ప్రారంభంలోనే పీకి నాశనం చేయండి")
                .warning("⚠️ ముఖ్య గమనిక: పురుగుమందుల మిశ్రమాలను శాస్త్రవేత్తల అనుమతి లేకుండా కలపవద్దు.")
                .build());

        treatmentRepository.save(Treatment.builder()
                .diseaseId(chilliLeafCurl.getId())
                .language("en")
                .title("Chilli Leaf Curl Virus Control")
                .steps("[\"1. Install 15 yellow & blue sticky traps per acre to trap vectors.\", \"2. Plant 4 border rows of maize or sorghum as wind barriers.\", \"3. Spray Neem oil (10,000 ppm) @ 2ml/L to deter sucking pests.\"]")
                .prevention("• Rogue out virus-infected plants early\n• Control nursery seedlings strictly")
                .warning("⚠️ Important: Follow manufacturer guidelines on pre-harvest interval.")
                .build());

        treatmentRepository.save(Treatment.builder()
                .diseaseId(chilliLeafCurl.getId())
                .language("hi")
                .title("मिर्च का पत्ती मरोड़ रोग नियंत्रण")
                .steps("[\"1. खेत में पीले और नीले चिपचिपे प्रपंच लगाएं।\", \"2. खेत की मेड़ों पर मक्का या ज्वार की 3-4 कतारें लगाएं।\", \"3. सफेद मक्खी नियंत्रण हेतु नीम तेल (10,000 ppm) का छिड़काव करें।\"]")
                .prevention("• प्रभावित पौधों को शुरुआत में ही उखाड़ दें\n• नर्सरी को कीटों से बचाएं")
                .warning("⚠️ महत्वपूर्ण: लेबल निर्देशों का ध्यान रखें।")
                .build());
    }

    private void seedMarketPrices() {
        LocalDate today = LocalDate.now();
        marketPriceRepository.saveAll(List.of(
                MarketPrice.builder().crop("Tomato").market("Guntur APMC Mandi").district("Guntur").state("Andhra Pradesh").price(2800.0).unit("quintal").date(today).source("AGMARKNET (Live)").trend("UP").build(),
                MarketPrice.builder().crop("Tomato").market("Vijayawada Rythu Bazar").district("Krishna").state("Andhra Pradesh").price(2650.0).unit("quintal").date(today).source("AP Mandi Board (Demo)").trend("STABLE").build(),
                MarketPrice.builder().crop("Tomato").market("Ongole Commercial Market").district("Prakasam").state("Andhra Pradesh").price(2700.0).unit("quintal").date(today).source("AP Mandi Board (Demo)").trend("UP").build(),
                MarketPrice.builder().crop("Tomato").market("Kurnool Agriculture Market").district("Kurnool").state("Andhra Pradesh").price(2600.0).unit("quintal").date(today).source("AGMARKNET (Live)").trend("DOWN").build(),
                MarketPrice.builder().crop("Tomato").market("Bowenpally Market Yard").district("Hyderabad").state("Telangana").price(2950.0).unit("quintal").date(today).source("AGMARKNET (Live)").trend("UP").build(),
                
                MarketPrice.builder().crop("Chilli").market("Guntur Mirchi Yard (Asia's Largest)").district("Guntur").state("Andhra Pradesh").price(18500.0).unit("quintal").date(today).source("Guntur Spices Board (Live)").trend("UP").build(),
                MarketPrice.builder().crop("Chilli").market("Khammam Agriculture Market").district("Khammam").state("Telangana").price(17800.0).unit("quintal").date(today).source("AGMARKNET (Live)").trend("STABLE").build(),
                
                MarketPrice.builder().crop("Rice").market("Tenali Paddy Market").district("Guntur").state("Andhra Pradesh").price(2350.0).unit("quintal").date(today).source("Food Corporation / Mandi").trend("STABLE").build(),
                MarketPrice.builder().crop("Rice").market("Miryalaguda Paddy Mandi").district("Nalgonda").state("Telangana").price(2420.0).unit("quintal").date(today).source("AGMARKNET (Live)").trend("UP").build(),
                
                MarketPrice.builder().crop("Cotton").market("Adilabad Cotton Yard").district("Adilabad").state("Telangana").price(7100.0).unit("quintal").date(today).source("CCI / APMC (Live)").trend("UP").build(),
                MarketPrice.builder().crop("Maize").market("Markapur Grain Market").district("Prakasam").state("Andhra Pradesh").price(2150.0).unit("quintal").date(today).source("AGMARKNET (Live)").trend("STABLE").build(),
                MarketPrice.builder().crop("Groundnut").market("Anantapur Market").district("Anantapur").state("Andhra Pradesh").price(6200.0).unit("quintal").date(today).source("AGMARKNET (Live)").trend("UP").build()
        ));
    }

    private void seedBuyers() {
        buyerRepository.saveAll(List.of(
                Buyer.builder().name("ABC Foods Agro Processing").phone("+91 98480 12345").location("Guntur Industrial Area").district("Guntur").state("Andhra Pradesh").crops("Tomato, Chilli").offeredPrice(2750.0).buyerType("Food Processor").verified(true).build(),
                Buyer.builder().name("Krishna Valley Exports").phone("+91 98490 23456").location("Vijayawada Port Bypass").district("Krishna").state("Andhra Pradesh").crops("Chilli, Rice, Tomato").offeredPrice(2720.0).buyerType("Exporter").verified(true).build(),
                Buyer.builder().name("Sri Venkateswara Agro Traders").phone("+91 94401 34567").location("Tenali Mandi Lane").district("Guntur").state("Andhra Pradesh").crops("Tomato, Vegetables").offeredPrice(2780.0).buyerType("Wholesaler").verified(true).build(),
                Buyer.builder().name("Prakasam Agro Procure").phone("+91 94412 45678").location("Ongole Bypass").district("Prakasam").state("Andhra Pradesh").crops("Tomato, Maize, Groundnut").offeredPrice(2690.0).buyerType("Wholesaler").verified(true).build(),
                Buyer.builder().name("Rayalaseema Agri Corp").phone("+91 97003 56789").location("Kurnool Bellary Road").district("Kurnool").state("Andhra Pradesh").crops("Tomato, Chilli, Cotton").offeredPrice(2680.0).buyerType("Retail Aggregator").verified(true).build(),
                Buyer.builder().name("Hyderabad Fresh Farm Direct").phone("+91 99887 67890").location("Kothapet Wholesale Complex").district("Hyderabad").state("Telangana").crops("Tomato, Vegetables").offeredPrice(2900.0).buyerType("Supermarket Chain").verified(true).build(),
                Buyer.builder().name("Markapur Farmgate Buyers").phone("+91 98488 78901").location("Markapur Town").district("Prakasam").state("Andhra Pradesh").crops("Chilli, Maize").offeredPrice(18200.0).buyerType("Food Processor").verified(true).build(),
                Buyer.builder().name("Amaravati Bio Foods").phone("+91 98661 89012").location("Mangalagiri Highway").district("Guntur").state("Andhra Pradesh").crops("Tomato, Rice").offeredPrice(2740.0).buyerType("Organic Wholesaler").verified(true).build(),
                Buyer.builder().name("Godavari Fresh Agri Traders").phone("+91 94405 90123").location("Eluru Road, Vijayawada").district("Krishna").state("Andhra Pradesh").crops("Rice, Tomato").offeredPrice(2710.0).buyerType("Wholesaler").verified(false).build(),
                Buyer.builder().name("Southern Spices & Agro").phone("+91 98481 01234").location("Chilakaluripet").district("Guntur").state("Andhra Pradesh").crops("Chilli, Tomato").offeredPrice(2760.0).buyerType("Spices Processor").verified(true).build()
        ));
    }

    private void seedFpos() {
        fpoRepository.saveAll(List.of(
                FPO.builder().name("Guntur Vegetable Farmer Producer Co.").location("Tenali Rural").district("Guntur").state("Andhra Pradesh").phone("+91 86322 55443").crops("Tomato, Chilli, Brinjal").memberCount(320).distanceKm(18.0).verified(true).build(),
                FPO.builder().name("Krishna Delta Paddy & Veg FPO").location("Gudivada").district("Krishna").state("Andhra Pradesh").phone("+91 86742 33221").crops("Rice, Tomato, Pulses").memberCount(450).distanceKm(32.0).verified(true).build(),
                FPO.builder().name("Prakasam Horticulture Producers Co.").location("Addanki").district("Prakasam").state("Andhra Pradesh").phone("+91 85932 44112").crops("Tomato, Chilli, Maize").memberCount(280).distanceKm(25.0).verified(true).build(),
                FPO.builder().name("Kurnool Natural Farmers FPO").location("Nandyal Road").district("Kurnool").state("Andhra Pradesh").phone("+91 85182 66778").crops("Tomato, Cotton, Groundnut").memberCount(510).distanceKm(40.0).verified(true).build(),
                FPO.builder().name("Amaravati Smart Farmers Producer Org").location("Thullur").district("Guntur").state("Andhra Pradesh").phone("+91 86324 88990").crops("Tomato, Banana, Vegetables").memberCount(390).distanceKm(14.0).verified(true).build(),
                FPO.builder().name("Markapur Dryland Farmers FPO").location("Markapur Mandi").district("Prakasam").state("Andhra Pradesh").phone("+91 85962 11334").crops("Chilli, Maize, Cotton").memberCount(210).distanceKm(12.0).verified(true).build(),
                FPO.builder().name("Palnadu Organic Agro FPO").location("Narasaraopet").district("Palnadu").state("Andhra Pradesh").phone("+91 86472 99887").crops("Chilli, Tomato, Cotton").memberCount(340).distanceKm(38.0).verified(true).build(),
                FPO.builder().name("Telangana Agri Collective Producer Co.").location("Shamshabad").district("Hyderabad").state("Telangana").phone("+91 84132 44556").crops("Tomato, Vegetables, Fruits").memberCount(620).distanceKm(65.0).verified(true).build()
        ));
    }

    private void seedColdStorage() {
        coldStorageRepository.saveAll(List.of(
                ColdStorage.builder().name("Sri Sai Cold Storage & Warehousing").location("Guntur Bypass, NH-16").district("Guntur").state("Andhra Pradesh").capacity(500.0).availableCapacity(120.0).supportedCrops("Tomato, Chilli, Vegetables").pricePerDay(15.0).priceUnit("per bag / month").phone("+91 86323 11223").latitude(16.3067).longitude(80.4365).distanceKm(12.0).verified(true).build(),
                ColdStorage.builder().name("Amaravati Agro Cold Logistics").location("Mangalagiri Road").district("Guntur").state("Andhra Pradesh").capacity(800.0).availableCapacity(250.0).supportedCrops("Tomato, Chilli, Fruits").pricePerDay(18.0).priceUnit("per bag / month").phone("+91 86324 22334").latitude(16.4350).longitude(80.5600).distanceKm(16.0).verified(true).build(),
                ColdStorage.builder().name("Krishna Mega Cold Chain").location("Gollapudi").district("Krishna").state("Andhra Pradesh").capacity(1200.0).availableCapacity(400.0).supportedCrops("Tomato, Mango, Vegetables").pricePerDay(20.0).priceUnit("per bag / month").phone("+91 86624 33445").latitude(16.5417).longitude(80.6012).distanceKm(28.0).verified(true).build(),
                ColdStorage.builder().name("Prakasam District Agro Storage").location("Ongole South").district("Prakasam").state("Andhra Pradesh").capacity(600.0).availableCapacity(80.0).supportedCrops("Chilli, Tomato, Tobacco").pricePerDay(14.0).priceUnit("per bag / month").phone("+91 85922 44556").latitude(15.5057).longitude(80.0499).distanceKm(22.0).verified(true).build(),
                ColdStorage.builder().name("Kurnool Temperature Controlled Warehouse").location("Dhone Highway").district("Kurnool").state("Andhra Pradesh").capacity(450.0).availableCapacity(110.0).supportedCrops("Tomato, Onion, Chilli").pricePerDay(16.0).priceUnit("per bag / month").phone("+91 85182 55667").latitude(15.8281).longitude(78.0373).distanceKm(35.0).verified(true).build(),
                ColdStorage.builder().name("Tenali Farmers Cold Hub").location("Karakatta Road").district("Guntur").state("Andhra Pradesh").capacity(300.0).availableCapacity(60.0).supportedCrops("Tomato, Vegetables").pricePerDay(12.0).priceUnit("per bag / month").phone("+91 86442 66778").latitude(16.2430).longitude(80.6400).distanceKm(8.0).verified(true).build(),
                ColdStorage.builder().name("Markapur Agri Storage").location("Railway Feeder Road").district("Prakasam").state("Andhra Pradesh").capacity(400.0).availableCapacity(140.0).supportedCrops("Chilli, Vegetables").pricePerDay(15.0).priceUnit("per bag / month").phone("+91 85962 77889").latitude(15.7350).longitude(79.2700).distanceKm(19.0).verified(true).build(),
                ColdStorage.builder().name("Chilakaluripet Spice & Fresh Storage").location("NH-16 Junction").district("Guntur").state("Andhra Pradesh").capacity(700.0).availableCapacity(190.0).supportedCrops("Chilli, Tomato").pricePerDay(16.0).priceUnit("per bag / month").phone("+91 86472 88990").latitude(16.0892).longitude(80.1672).distanceKm(24.0).verified(true).build(),
                ColdStorage.builder().name("Vijayawada Sub-Zero Agro Preservers").location("Enikepadu Industrial Park").district("Krishna").state("Andhra Pradesh").capacity(900.0).availableCapacity(310.0).supportedCrops("Tomato, Fruits, Vegetables").pricePerDay(19.0).priceUnit("per bag / month").phone("+91 86628 99001").latitude(16.5167).longitude(80.6833).distanceKm(34.0).verified(true).build(),
                ColdStorage.builder().name("Hyderabad Agri Cold Chain").location("Gaganpahad, NH-44").district("Hyderabad").state("Telangana").capacity(1500.0).availableCapacity(520.0).supportedCrops("Tomato, Potato, Vegetables").pricePerDay(22.0).priceUnit("per bag / month").phone("+91 84132 00112").latitude(17.3200).longitude(78.4100).distanceKm(70.0).verified(true).build()
        ));
    }

    private void seedLogisticsProviders() {
        logisticsProviderRepository.saveAll(List.of(
                LogisticsProvider.builder().name("AgriCare Mini Express (Ramu Transport)").phone("+91 98481 11222").location("Tenali Stand").district("Guntur").state("Andhra Pradesh").vehicleType("Mini Truck (Tata Ace)").capacity(1.0).estimatedCost(1200.0).ratePerKm(22.0).verified(true).build(),
                LogisticsProvider.builder().name("Sri Venkateswara Farm Haulers").phone("+91 98482 22333").location("Guntur Autonagar").district("Guntur").state("Andhra Pradesh").vehicleType("Pickup Truck (Bolero Maxi)").capacity(2.0).estimatedCost(1800.0).ratePerKm(28.0).verified(true).build(),
                LogisticsProvider.builder().name("Krishna Delta Fast Transport").phone("+91 98483 33444").location("Vijayawada Benz Circle").district("Krishna").state("Andhra Pradesh").vehicleType("Canter (4 Ton)").capacity(4.0).estimatedCost(3200.0).ratePerKm(35.0).verified(true).build(),
                LogisticsProvider.builder().name("Prakasam Rythu Vahan").phone("+91 98484 44555").location("Ongole Bypass").district("Prakasam").state("Andhra Pradesh").vehicleType("Mini Truck (Tata Ace)").capacity(1.0).estimatedCost(1150.0).ratePerKm(20.0).verified(true).build(),
                LogisticsProvider.builder().name("Kurnool Kisan Carriers").phone("+91 98485 55666").location("Kurnool Old City").district("Kurnool").state("Andhra Pradesh").vehicleType("Pickup Truck (Bolero)").capacity(2.0).estimatedCost(1750.0).ratePerKm(26.0).verified(true).build(),
                LogisticsProvider.builder().name("Amaravati Agro Freight").phone("+91 98486 66777").location("Mangalagiri").district("Guntur").state("Andhra Pradesh").vehicleType("Canter (6 Ton Heavy)").capacity(6.0).estimatedCost(4500.0).ratePerKm(42.0).verified(true).build(),
                LogisticsProvider.builder().name("Markapur Rural Logistics").phone("+91 98487 77888").location("Markapur Mandi Gate").district("Prakasam").state("Andhra Pradesh").vehicleType("Mini Truck (Tata Ace)").capacity(1.0).estimatedCost(1100.0).ratePerKm(20.0).verified(true).build(),
                LogisticsProvider.builder().name("Chilakaluripet Spices Transport").phone("+91 98488 88999").location("Chilakaluripet NH-16").district("Guntur").state("Andhra Pradesh").vehicleType("Pickup Truck (Bolero)").capacity(2.5).estimatedCost(2100.0).ratePerKm(29.0).verified(true).build(),
                LogisticsProvider.builder().name("Golden Grain Heavy Haulers").phone("+91 98489 99000").location("Tenali Industrial Estate").district("Guntur").state("Andhra Pradesh").vehicleType("Heavy Truck (10 Ton)").capacity(10.0).estimatedCost(7500.0).ratePerKm(55.0).verified(true).build(),
                LogisticsProvider.builder().name("Telangana Agri Logistics Fleet").phone("+91 98480 00111").location("Shamshabad").district("Hyderabad").state("Telangana").vehicleType("Refrigerated Van (3 Ton)").capacity(3.0).estimatedCost(4200.0).ratePerKm(40.0).verified(true).build()
        ));
    }

    private void seedInitialDiagnoses() {
        // Pre-seed some realistic history items for the demo farmer so History screen is rich immediately
        diagnosisRepository.save(Diagnosis.builder()
                .userId(1L)
                .crop("Tomato")
                .disease("Early Blight")
                .confidence(0.94)
                .severity("Medium")
                .findings("Concentric dark brown rings and target-like lesions identified on lower leaf surface.")
                .build());

        diagnosisRepository.save(Diagnosis.builder()
                .userId(1L)
                .crop("Chilli")
                .disease("Leaf Curl")
                .confidence(0.89)
                .severity("Medium")
                .findings("Upward curling of leaf margins and vein thickening detected.")
                .build());

        diagnosisRepository.save(Diagnosis.builder()
                .userId(1L)
                .crop("Rice")
                .disease("Leaf Blast")
                .confidence(0.92)
                .severity("High")
                .findings("Spindle-shaped lesions with grayish-white centers observed on paddy leaves.")
                .build());
    }

    private void seedRbacAndMarketplaceData() {
        // Ensure Farmer Ramesh exists
        User farmer = userRepository.findByPhone("9876543210").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Ramesh Kumar (Farmer)")
                        .phone("9876543210")
                        .password(passwordEncoder.encode("farmer123"))
                        .role(User.Role.FARMER)
                        .language("te")
                        .state("Andhra Pradesh")
                        .district("Guntur")
                        .village("Tenali")
                        .build())
        );

        // Ensure Buyer Kavitha exists
        User buyer = userRepository.findByPhone("9848012345").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Kavitha Wholesale Foods")
                        .phone("9848012345")
                        .password(passwordEncoder.encode("buyer123"))
                        .role(User.Role.BUYER)
                        .language("en")
                        .state("Andhra Pradesh")
                        .district("Krishna")
                        .village("Vijayawada")
                        .build())
        );

        // Ensure FPO exists
        User fpoUser = userRepository.findByPhone("8632255443").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Guntur Rythu Mitra FPO")
                        .phone("8632255443")
                        .password(passwordEncoder.encode("fpo123"))
                        .role(User.Role.FPO)
                        .language("te")
                        .state("Andhra Pradesh")
                        .district("Guntur")
                        .village("Tenali")
                        .build())
        );

        // Ensure Storage Provider exists
        User storageUser = userRepository.findByPhone("8632311223").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Krishna Cold Storage Ltd")
                        .phone("8632311223")
                        .password(passwordEncoder.encode("storage123"))
                        .role(User.Role.STORAGE_PROVIDER)
                        .language("en")
                        .state("Andhra Pradesh")
                        .district("Guntur")
                        .village("Tenali")
                        .build())
        );

        // Link storage facility ownerId
        coldStorageRepository.findAll().stream().findFirst().ifPresent(cs -> {
            if (cs.getOwnerId() == null) {
                cs.setOwnerId(storageUser.getId());
                coldStorageRepository.save(cs);
            }
        });

        // Ensure Logistics Provider exists
        User logisticsUser = userRepository.findByPhone("9848111222").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Sri Balaji Farm Logistics")
                        .phone("9848111222")
                        .password(passwordEncoder.encode("trans123"))
                        .role(User.Role.LOGISTICS_PROVIDER)
                        .language("te")
                        .state("Andhra Pradesh")
                        .district("Guntur")
                        .village("Guntur City")
                        .build())
        );

        // Link logistics provider ownerId
        logisticsProviderRepository.findAll().stream().findFirst().ifPresent(lp -> {
            if (lp.getOwnerId() == null) {
                lp.setOwnerId(logisticsUser.getId());
                logisticsProviderRepository.save(lp);
            }
        });

        // Seed Sample Produce Listings if empty
        if (produceListingRepository.count() == 0) {
            log.info("Seeding realistic farmer produce listings into marketplace...");
            ProduceListing listing1 = produceListingRepository.save(ProduceListing.builder()
                    .farmerId(farmer.getId())
                    .farmerName(farmer.getName())
                    .farmerPhone(farmer.getPhone())
                    .crop("Tomato")
                    .quantityKg(500.0)
                    .askingPricePerQuintal(2700.0)
                    .location("Tenali Farm Gate")
                    .district("Guntur")
                    .status(ProduceListing.Status.AVAILABLE)
                    .notes("Grade-A hybrid red tomatoes, freshly harvested today. Ready for immediate pickup.")
                    .build());

            produceListingRepository.save(ProduceListing.builder()
                    .farmerId(farmer.getId())
                    .farmerName(farmer.getName())
                    .farmerPhone(farmer.getPhone())
                    .crop("Chilli")
                    .quantityKg(250.0)
                    .askingPricePerQuintal(18500.0)
                    .location("Tenali Farm Gate")
                    .district("Guntur")
                    .status(ProduceListing.Status.AVAILABLE)
                    .notes("Guntur Teja dry red chilli. Super fine quality, low moisture content.")
                    .build());

            produceListingRepository.save(ProduceListing.builder()
                    .farmerId(farmer.getId())
                    .farmerName("Suresh Reddy (Farmer)")
                    .farmerPhone("9848223344")
                    .crop("Rice")
                    .quantityKg(1000.0)
                    .askingPricePerQuintal(2450.0)
                    .location("Bapatla Farm")
                    .district("Guntur")
                    .status(ProduceListing.Status.AVAILABLE)
                    .notes("BPT 5204 Sona Masoori paddy. Harvested last week, completely dried.")
                    .build());

            // Seed Sample Purchase Offer / Order
            log.info("Seeding sample produce purchase offer...");
            produceOrderRepository.save(ProduceOrder.builder()
                    .orderNumber("ORD-2026-00101")
                    .listingId(listing1.getId())
                    .farmerId(farmer.getId())
                    .farmerName(farmer.getName())
                    .farmerPhone(farmer.getPhone())
                    .buyerId(buyer.getId())
                    .buyerName(buyer.getName())
                    .buyerPhone(buyer.getPhone())
                    .buyerType("Wholesaler")
                    .crop("Tomato")
                    .quantityKg(500.0)
                    .offeredPricePerQuintal(2750.0)
                    .totalAmount(13750.0)
                    .status(ProduceOrder.Status.OFFERED)
                    .pickupLocation("Tenali Farm Gate")
                    .deliveryDestination("Vijayawada Wholesale APMC")
                    .build());
        }

        // Seed Sample Storage Booking if empty
        if (storageBookingRepository.count() == 0) {
            storageBookingRepository.save(StorageBooking.builder()
                    .bookingNumber("SB-2026-00041")
                    .storageId(1L)
                    .storageName("Krishna Cold Storage")
                    .userId(farmer.getId())
                    .userName(farmer.getName())
                    .userPhone(farmer.getPhone())
                    .userRole("FARMER")
                    .crop("Chilli")
                    .quantityMt(2.0)
                    .durationDays(30)
                    .estimatedCost(3000.0)
                    .status(StorageBooking.Status.APPROVED)
                    .notes("Reserved 2 MT space for Guntur Chilli storage.")
                    .build());
        }
    }
}
