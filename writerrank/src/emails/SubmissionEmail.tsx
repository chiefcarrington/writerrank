// src/emails/SubmissionEmail.tsx
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
     Tailwind, // If you want to use Tailwind CSS
  } from '@react-email/components';
  import * as React from 'react';
  
  interface SubmissionEmailProps {
    userEmail: string;
    prompt: string;
    submissionText: string;
  }
  
  export const SubmissionEmail: React.FC<Readonly<SubmissionEmailProps>> = ({
    userEmail,
    prompt,
    submissionText,
  }) => {
    const previewText = `Here's a copy of your recent writing submission!`;
  
    return (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        {/* Wrap with Tailwind component if you want to use Tailwind classes here.
          Ensure your Tailwind config is set up to scan this emails directory, or use inline styles.
          <Tailwind> ... </Tailwind> 
        */}
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>Your Writing Submission 🖋️</Heading>
            <Text style={paragraph}>Hello {userEmail.split('@')[0]},</Text>
            <Text style={paragraph}>
              Thank you for writing with WriterRank! Here’s a copy of your response to the daily prompt:
            </Text>
            <Section style={sectionBox}>
              <Heading as="h2" style={subHeading}>
                The Prompt:
              </Heading>
              <Text style={promptText}>{prompt}</Text>
            </Section>
            <Section style={sectionBox}>
              <Heading as="h2" style={subHeading}>
                Your Submission:
              </Heading>
              <Text style={submissionContent}>{submissionText}</Text>
            </Section>
            <Hr style={hr} />
            <Text style={footer}>
              WriterRank - Keep writing, keep growing!
              <br />
              {/* You can add your app's URL here */}
            </Text>
          </Container>
        </Body>
      </Html>
    );
  };
  
  export default SubmissionEmail;
  
  // Basic inline styles (Tailwind via <Tailwind> component is often preferred for more complex styling)
  const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    padding: '20px 0',
  };
  
  const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #eee',
    borderRadius: '5px',
    boxShadow: '0 2px 3px rgba(0,0,0,0.06)',
    maxWidth: '580px',
  };
  
  const heading = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    lineHeight: '1.4',
    textAlign: 'center' as const, // Added 'as const' for type compatibility
    marginBottom: '20px',
  };
  
  const subHeading = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#444',
    marginTop: '20px',
    marginBottom: '10px',
  }
  
  const sectionBox = {
    border: '1px solid #eaeaea',
    borderRadius: '5px',
    padding: '15px',
    marginBottom: '20px',
    backgroundColor: '#f9f9f9',
  }
  
  const paragraph = {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '15px',
  };
  
  const promptText = {
    ...paragraph,
    fontStyle: 'italic',
    color: '#333',
  };
  
  const submissionContent = {
    ...paragraph,
    whiteSpace: 'pre-wrap' as const, // Added 'as const'
    wordBreak: 'break-word' as const, // Added 'as const'
    color: '#333',
  };
  
  const hr = {
    borderColor: '#cccccc',
    margin: '20px 0',
  };
  
  const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '1.5',
    textAlign: 'center' as const, // Added 'as const'
  };