import AppHeader from '@/components/shared/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const rules = [
    {
        title: "1. Customer Interaction",
        english: "Every employee must communicate politely and respectfully with all customers. Abusive language or rude behavior is strictly prohibited. Your primary goal is to provide a positive experience.",
        hindi: "प्रत्येक कर्मचारी को सभी ग्राहकों के साथ विनम्रता और सम्मानपूर्वक संवाद करना चाहिए। अपमानजनक भाषा या अशिष्ट व्यवहार सख्त वर्जित है। आपका प्राथमिक लक्ष्य एक सकारात्मक अनुभव प्रदान करना है।"
    },
    {
        title: "2. Official Documentation",
        english: "All employees are required to possess their official Employee Confidential Information (ECC) document at all times during work hours. An individual without this document will not be recognized as a company employee.",
        hindi: "सभी कर्मचारियों को काम के घंटों के दौरान हर समय अपना आधिकारिक कर्मचारी गोपनीय सूचना (ईसीसी) दस्तावेज़ रखना आवश्यक है। इस दस्तावेज़ के बिना किसी भी व्यक्ति को कंपनी का कर्मचारी नहीं माना जाएगा।"
    },
    {
        title: "3. Discipline and Regulation",
        english: "Maintain utmost discipline and professionalism during company work hours. All work must be performed uniformly and ethically. Any inappropriate activities are strictly forbidden.",
        hindi: "कंपनी के काम के घंटों के दौरान अत्यंत अनुशासन और व्यावसायिकता बनाए रखें। सभी काम समान रूप से और नैतिक रूप से किए जाने चाहिए। किसी भी प्रकार की अनुचित गतिविधियाँ सख्त वर्जित हैं।"
    },
    {
        title: "4. Primary Job Role",
        english: "The main responsibility of an employee is to find and attract new customers for the company. It is crucial to treat every potential and existing customer with respect and provide them with accurate information.",
        hindi: "एक कर्मचारी की मुख्य जिम्मेदारी कंपनी के लिए नए ग्राहक ढूंढना और उन्हें आकर्षित करना है। प्रत्येक संभावित और मौजूदा ग्राहक के साथ सम्मान से पेश आना और उन्हें सटीक जानकारी प्रदान करना महत्वपूर्ण है।"
    },
    {
        title: "5. Commission and Incentives",
        english: "Compensation is performance-based. For sales from clients purchasing flutes under ₹1000, you will receive a 25% commission. For sales from clients purchasing flutes worth ₹1000 or more, you will receive a 30% commission. Top-performing employees will be rewarded with higher commission tiers (30% instead of 25%, and 35% instead of 30%), with the potential to reach up to 40%. This opportunity is reserved for consistent top performers.",
        hindi: "मुआवजा प्रदर्शन-आधारित है। ₹1000 से कम की बांसुरी खरीदने वाले ग्राहकों से बिक्री के लिए, आपको 25% कमीशन मिलेगा। ₹1000 या उससे अधिक की बांसुरी खरीदने वाले ग्राहकों से बिक्री के लिए, आपको 30% कमीशन मिलेगा। शीर्ष प्रदर्शन करने वाले कर्मचारियों को उच्च कमीशन स्तरों से पुरस्कृत किया जाएगा (25% के बजाय 30%, और 30% के बजाय 35%), जिसमें 40% तक पहुंचने की क्षमता है। यह अवसर केवल लगातार शीर्ष प्रदर्शन करने वालों के लिए आरक्षित है।"
    },
    {
        title: "6. Hierarchy and Respect",
        english: "All employees must respect the company's hierarchy. Show the highest respect to the Owner, followed by the CEO, and then the Chief of Staff (CoS) or Personal Assistant (PA). Disrespectful behavior towards anyone in the company will not be tolerated. Maintain discipline at all times.",
        hindi: "सभी कर्मचारियों को कंपनी के पदानुक्रम का सम्मान करना चाहिए। मालिक को सर्वोच्च सम्मान दें, उसके बाद सीईओ, और फिर चीफ ऑफ स्टाफ (सीओएस) या पर्सनल असिस्टेंट (पीए) को। कंपनी में किसी के भी प्रति अनादरपूर्ण व्यवहार बर्दाश्त नहीं किया जाएगा। हर समय अनुशासन बनाए रखें।"
    }
];

export default function EmployeeRulesPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-slide-in">
        <div className="mx-auto grid w-full max-w-4xl items-start gap-6">
            <h2 className="text-2xl font-bold text-center text-primary">Employee Rules & Guidelines</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Code of Conduct</CardTitle>
                    <CardDescription>
                        These rules are mandatory for all PJ OFFICIAL employees to ensure a professional, respectful, and productive work environment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {rules.map((rule, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-lg hover:no-underline">{rule.title}</AccordionTrigger>
                                <AccordionContent className="space-y-4 px-2">
                                    <div>
                                        <h4 className="font-semibold mb-1 text-base text-foreground">English:</h4>
                                        <p className="text-muted-foreground">{rule.english}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1 text-base text-foreground">Hindi (हिन्दी):</h4>
                                        <p className="text-muted-foreground">{rule.hindi}</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
