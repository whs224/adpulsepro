
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      id: "1",
      question: "What is Adpulse?",
      answer: "Adpulse is a tool that helps you analyze and understand your ad performance across platforms like Google Ads, Meta Ads, TikTok Ads, and LinkedIn Ads — all in one place."
    },
    {
      id: "2", 
      question: "Which ad platforms does Adpulse support?",
      answer: "We currently support Google Ads, Meta Ads (Facebook & Instagram), TikTok Ads, and LinkedIn Ads. More integrations are planned as we grow."
    },
    {
      id: "3",
      question: "Do I need to manually upload my ad data?",
      answer: "No. Once you connect your ad accounts, Adpulse automatically pulls in your performance data for analysis."
    },
    {
      id: "4",
      question: "Can I download my ad performance reports?",
      answer: "Yes. You can generate a clear, professional PDF report that includes key metrics, charts, and optimization suggestions."
    },
    {
      id: "5",
      question: "Will Adpulse make changes to my campaigns?",
      answer: "No. You stay fully in control. Adpulse only analyzes your data and provides smart recommendations."
    },
    {
      id: "6",
      question: "Is my data secure?",
      answer: "Absolutely. We use secure OAuth connections and encrypt all data. Your credentials and campaign information are never shared."
    },
    {
      id: "7",
      question: "How often is data updated?",
      answer: "Adpulse updates your data automatically every 24 hours. You can also sync manually at any time."
    },
    {
      id: "8",
      question: "How much does it cost?",
      answer: "Our MVP pricing is just $5 per report. This is a special launch price to help us validate the product and gather feedback."
    },
    {
      id: "9",
      question: "How do I connect my ad accounts?",
      answer: "Simply go to Settings after signing up, and use our secure OAuth integration to connect your Google Ads, Meta Ads, TikTok Ads, and LinkedIn Ads accounts."
    },
    {
      id: "10",
      question: "What kind of recommendations do you provide?",
      answer: "Our AI analyzes your data and provides actionable recommendations like budget reallocation suggestions, audience optimization tips, campaign pause recommendations, and bid adjustment strategies."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about AdPulse and how it can help optimize your advertising campaigns.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Common Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <div className="mt-12 text-center">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h3>
                  <p className="text-gray-600 mb-6">
                    Can't find what you're looking for? We're here to help!
                  </p>
                  <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">📧</span>
                      <a href="mailto:contact@adpulse.pro" className="text-blue-600 hover:underline">
                        contact@adpulse.pro
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">📞</span>
                      <a href="tel:415-317-6427" className="text-blue-600 hover:underline">
                        415-317-6427
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
