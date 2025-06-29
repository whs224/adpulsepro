
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      id: "1",
      question: "What is AdPulse?",
      answer: "AdPulse is an AI-powered advertising assistant that connects to your ad accounts (Google Ads, Meta, TikTok, LinkedIn) and lets you chat with AI to get instant insights about your campaign performance. No more manual reports or spreadsheet analysis."
    },
    {
      id: "2", 
      question: "Which ad platforms does AdPulse support?",
      answer: "We currently support Google Ads, Meta Ads (Facebook & Instagram), TikTok Ads, and LinkedIn Ads. Simply connect your accounts and start chatting with our AI about your performance data."
    },
    {
      id: "3",
      question: "How does the AI chat work?",
      answer: "Once you connect your ad accounts, you can ask our AI questions in plain English like 'How did my Google Ads perform last week?' or 'Which campaign has the lowest cost per click?' The AI analyzes your real data and gives you instant, actionable insights."
    },
    {
      id: "4",
      question: "Do I need to upload my ad data manually?",
      answer: "No! AdPulse automatically connects to your ad platforms via secure OAuth and pulls your performance data in real-time. Just connect once and start chatting."
    },
    {
      id: "5",
      question: "Will AdPulse make changes to my campaigns?",
      answer: "Absolutely not. AdPulse is read-only and only analyzes your data to provide insights and recommendations. You stay in complete control of your campaigns."
    },
    {
      id: "6",
      question: "Is my data secure?",
      answer: "Yes. We use bank-level security with encrypted OAuth connections. Your ad data and credentials are never stored permanently and are only used to generate your requested insights."
    },
    {
      id: "7",
      question: "How does the credit system work?",
      answer: "Each AI chat message costs 1 credit. Our Growth plan includes 100 credits/month for 3 users, and our Scale plan includes 500 credits/month for 10 users. Credits reset monthly."
    },
    {
      id: "8",
      question: "Can multiple team members use one account?",
      answer: "Yes! Both our Growth and Scale plans support multiple users. Your team can collaborate and everyone gets access to the same AI-powered insights."
    },
    {
      id: "9",
      question: "How do I connect my ad accounts?",
      answer: "Go to your dashboard after signing up and click 'Connect Account' for each platform. We use secure OAuth so you never share your passwords with us."
    },
    {
      id: "10",
      question: "What kind of questions can I ask the AI?",
      answer: "Ask anything about your ad performance! Examples: 'Compare my Facebook and Google ad costs this month', 'Which audiences perform best on TikTok?', 'Show me my worst performing campaigns', or 'What's my overall ROAS trend?'"
    },
    {
      id: "11",
      question: "Is there a free trial?",
      answer: "We don't offer free trials, but both plans are very affordable and you can cancel anytime. Start with our Growth plan to see how AdPulse transforms your ad analysis workflow."
    },
    {
      id: "12",
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period."
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
              Everything you need to know about AdPulse and how our AI assistant can transform your advertising workflow.
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
