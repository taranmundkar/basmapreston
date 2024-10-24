'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'

export default function LandingPage() {
  const [userType, setUserType] = useState<'buy' | 'sell' | 'rent' | null>(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [consent, setConsent] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  const buyQuestions = [
    {
      id: 'budget',
      question: 'What is your budget for buying a home?',
      options: ['Under $200,000', '$200,000-$300,000', '$300,000-$400,000', '$400,000-$500,000', '$500,000+'],
    },
    {
      id: 'bedrooms',
      question: 'How many bedrooms are you looking for?',
      options: ['1', '2', '3', '4', '5+'],
    },
    {
      id: 'bathrooms',
      question: 'How many bathrooms do you need?',
      options: ['1', '1.5', '2', '2.5', '3+'],
    },
    {
      id: 'location',
      question: 'What is your preferred location?',
      type: 'text',
    },
    {
      id: 'timeline',
      question: 'When are you looking to move in?',
      options: ['ASAP', 'Within 1 month', '1-3 months', '3-6 months', '6+ months'],
    },
    {
      id: 'preApproval',
      question: 'Have you been pre-approved for a mortgage?',
      options: ['Yes', 'No', 'Not yet, but I\'m working on it'],
    },
    {
      id: 'agentContract',
      question: 'Are you currently under contract with a real estate agent?',
      options: ['Yes', 'No'],
    },
  ]

  const sellQuestions = [
    {
      id: 'propertyType',
      question: 'What type of property are you selling?',
      options: ['Single-family home', 'Condo', 'Townhouse', 'Multi-family home', 'Other'],
    },
    {
      id: 'bedrooms',
      question: 'How many bedrooms does your property have?',
      options: ['1', '2', '3', '4', '5+'],
    },
    {
      id: 'bathrooms',
      question: 'How many bathrooms does your property have?',
      options: ['1', '1.5', '2', '2.5', '3+'],
    },
    {
      id: 'location',
      question: 'Where is your property located?',
      type: 'text',
    },
    {
      id: 'timeline',
      question: 'When are you looking to sell?',
      options: ['ASAP', 'Within 1 month', '1-3 months', '3-6 months', '6+ months'],
    },
    {
      id: 'reason',
      question: 'What is your primary reason for selling?',
      options: ['Upgrading', 'Downsizing', 'Relocating', 'Investment', 'Other'],
    },
    {
      id: 'agentContract',
      question: 'Are you currently under contract with a real estate agent?',
      options: ['Yes', 'No'],
    },
  ]

  const rentQuestions = [
    {
      id: 'budget',
      question: 'What is your monthly budget for rent?',
      options: ['Under $1000', '$1000-$1500', '$1500-$2000', '$2000-$2500', '$2500+'],
    },
    {
      id: 'bedrooms',
      question: 'How many bedrooms are you looking for?',
      options: ['Studio', '1', '2', '3', '4+'],
    },
    {
      id: 'bathrooms',
      question: 'How many bathrooms do you need?',
      options: ['1', '1.5', '2', '2.5', '3+'],
    },
    {
      id: 'location',
      question: 'What is your preferred location?',
      type: 'text',
    },
    {
      id: 'petFriendly',
      question: 'Do you need a pet-friendly rental?',
      options: ['Yes', 'No'],
    },
    {
      id: 'timeline',
      question: 'When do you need to move in?',
      options: ['ASAP', 'Within 1 month', '1-3 months', '3-6 months', '6+ months'],
    },
    {
      id: 'agentContract',
      question: 'Are you currently under contract with a real estate agent?',
      options: ['Yes', 'No'],
    },
  ]

  const questions = userType === 'buy'
    ? buyQuestions
    : userType === 'sell'
      ? sellQuestions
      : rentQuestions

  const handleUserTypeSelection = (type: 'buy' | 'sell' | 'rent') => {
    setUserType(type)
    setStep(0)
    setAnswers({})
    setOverallProgress(0);
  }

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers({ ...answers, [questions[step].id]: answer });
    if (step < questions.length - 1) {
      setStep(step + 1);
      setSelectedAnswer(null);
      setOverallProgress(((step + 2) / questions.length) * 100);
    } else {
      setOverallProgress(100);
    }
  };


  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      const newAnswers = { ...answers };
      delete newAnswers[questions[step].id]
      setAnswers(newAnswers);
      setOverallProgress(((step - 1) / questions.length) * 100);
    } else {
      // Reset to initial state when going back from the first question
      setUserType(null);
      setStep(0);
      setAnswers({});
      setSelectedAnswer(null);
      setOverallProgress(0);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (consent) {
      setIsVerifying(true)
    } else {
      alert('Please provide consent to submit your information.')
    }
  }

  const handleEdit = (field: string | null) => {
    setEditingField(field)
  }

  const handleSaveEdit = (field: string, value: string) => {
    setAnswers({ ...answers, [field]: value })
    setEditingField(null)
  }

  const handleFinalSubmit = () => {
    console.log('Form submitted:', answers)
    setIsFinalSubmitted(true)
  }

  const currentQuestion = questions[step]
  const isAnswered = answers[currentQuestion?.id]

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-falling4utah-2724749-Wqoqy2VN0WoWhfNdnux6HuiDgs6nsI.jpg"
        alt="Modern white kitchen with island"
        fill
        style={{ objectFit: 'cover' }}
        priority
        className="absolute inset-0"
      />
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <main className="relative z-10 w-full max-w-md mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8 drop-shadow-lg">Find Your Dream Home</h1>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
          {!userType ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-3 text-center">What would you like to do?</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleUserTypeSelection('buy')}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Buy
                </button>
                <button
                  onClick={() => handleUserTypeSelection('sell')}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Sell
                </button>
                <button
                  onClick={() => handleUserTypeSelection('rent')}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Rent
                </button>
              </div>
              <div className="mt-6 text-center text-xs text-gray-600">
                <p>&copy; 2024 TTM Media. All rights reserved.</p>
                <p className="mt-1">
                  <a href="#" className="text-gray-600 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          ) : !isVerifying && !isFinalSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-3 text-center">{currentQuestion.question}</h2>
              <div className="space-y-2">
                <progress value={overallProgress} className="w-full h-2" />
              </div>
              {currentQuestion.options ? (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswer(option)}
                      className={`px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${selectedAnswer === option ? 'bg-gray-200' : ''
                        }`}
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                  value={answers[currentQuestion.id] || ''}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  placeholder={`Enter your ${currentQuestion.id}`}
                />
              )}
              {step === questions.length - 1 && (
                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="h-4 w-4 text-gray-700 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-xs text-gray-700">
                      I consent to submitting my information and agree to the{' '}
                      <a href="#" className="text-gray-700 hover:underline">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                </div>
              )}
              <div className="flex justify-between mt-6">
                <div>
                  <button
                    onClick={handleBack}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    Back
                  </button>
                </div>
                {step === questions.length - 1 ? (
                  <button
                    type="submit"
                    disabled={!consent || !isAnswered}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md text-white bg-gray-700 hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={!isAnswered}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md text-white bg-gray-700 hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    Next
                  </button>
                )}
              </div>
            </form>
          ) : isVerifying && !isFinalSubmitted ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-3 text-center">Verify Your Information</h2>
              {questions.map((q) => (
                <div key={q.id} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{q.question}</span>
                  {editingField === q.id ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => handleSaveEdit(q.id, answers[q.id])}
                        className="ml-2 text-xs text-gray-700 hover:underline"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700">{answers[q.id]}</span>
                      <button
                        onClick={() => handleEdit(q.id)}
                        className="ml-2 text-xs text-gray-700 hover:underline"
                        aria-label={`Edit ${q.question}`}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={handleFinalSubmit}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-white bg-gray-700 hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2  focus:ring-offset-2 focus:ring-gray-500"
              >
                Confirm and Submit
              </button>
            </div>
          ) : isFinalSubmitted ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Thank You!</h2>
              <p className="text-gray-700 mb-6">
                {userType === 'buy'
                  ? "We appreciate your interest in buying a home. Our team will review your preferences and get back to you soon with personalized recommendations."
                  : userType === 'sell'
                    ? "Thank you for providing information about your property. Our team will analyze the details and contact you shortly to discuss potential selling opportunities."
                    : "We appreciate your interest in renting a home. Our team will review your preferences and get back to you soon with personalized recommendations."}
              </p>
              <p className="text-gray-700 mb-6">
                A confirmation email has been sent to your provided email address with further details.
              </p>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 text-sm border border-gray-300 rounded-md text-white bg-gray-700 hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Book Your Appointment
              </a>
              <button
                onClick={() => {
                  setUserType(null)
                  setStep(0)
                  setAnswers({})
                  setConsent(false)
                  setIsVerifying(false)
                  setIsFinalSubmitted(false)
                  setOverallProgress(0);
                }}
                className="mt-4 px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Start Over
              </button>
            </div>
          ) : null}
        </div>
        <footer className="mt-6 text-center text-xs text-gray-700 drop-shadow">
          <p>&copy; 2024 TTM Media. All rights reserved.</p>
          <p className="mt-1">
            <a href="#" className="text-gray-700 hover:underline">Privacy Policy</a> |
            <a href="#" className="text-gray-700 hover:underline ml-2">Terms of Service</a>
          </p>
        </footer>
      </main>
    </div>
  )
}