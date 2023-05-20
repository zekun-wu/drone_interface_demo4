import React, { useState, useEffect, forwardRef} from 'react';
import './Questionnaire.css';
import DroneBlock from './DroneBlock';
import './DroneMonitor.css';
import droneIconImg from './icons/zone/fly.png';

import { shuffle } from 'lodash'; 

const only_non_critical_questions = [
  {
    question: 'What are the battery levels of the drones now?',
    number:1,
    subquestions: [
      {
        drone: 'Drone 1',
        options: ['<70%', '70-80%', '80-90%', '>90%', "I don’t know"],
      },
      {
        drone: 'Drone 2',
        options: ['<70%', '70-80%', '80-90%', '>90%', "I don’t know"],
      },
      {
        drone: 'Drone 3',
        options: ['<70%', '70-80%', '80-90%', '>90%', "I don’t know"],
      },
      {
        drone: 'Drone 4',
        options: ['<70%', '70-80%', '80-90%', '>90%', "I don’t know"],
      }
    ],
  },
  {
    question: 'What are the horizontal speed of the drones now?',
    number:2,
    subquestions: [
      {
        drone: 'Drone 1',
        options: ['<5m/s', '5-10m/s', '10-20m/s', '>20m/s', "I don’t know"],
      },
      {
        drone: 'Drone 2',
        options: ['<5m/s', '5-10m/s', '10-20m/s', '>20m/s', "I don’t know"],
      },
      {
        drone: 'Drone 3',
        options: ['<5m/s', '5-10m/s', '10-20m/s', '>20m/s', "I don’t know"],
      },
      {
        drone: 'Drone 4',
        options: ['<5m/s', '5-10m/s', '10-20m/s', '>20m/s', "I don’t know"],
      }
    ],
  },
  {
    question: 'What is the distance to the destination for each drone now?',
    number:3,
    subquestions: [
      {
        drone: 'Drone 1',
        options: ['<1000m', '1000-2000m', '2000-5000m', '>5000m', "I don’t know"],
      },
      {
        drone: 'Drone 2',
        options: ['<1000m', '1000-2000m', '2000-5000m', '>5000m', "I don’t know"],
      },
      {
        drone: 'Drone 3',
        options: ['<1000m', '1000-2000m', '2000-5000m', '>5000m', "I don’t know"],
      },
      {
        drone: 'Drone 4',
        options: ['<1000m', '1000-2000m', '2000-5000m', '>5000m', "I don’t know"],
      }
    ],
  },
];

const buildNonCriticalQuestions = (only_non_critical_questions, allDronesCurrentData) => {
  return only_non_critical_questions.map(question => {
    let specificAnswer;

    if (question.number === 1) {
      specificAnswer = question.subquestions.map((subquestion, index) => {
        const droneBattery = allDronesCurrentData[index]['battery']*100;
        let optionIndex;

        if (droneBattery < 70) {
          optionIndex = 0;
        } else if (droneBattery >= 70 && droneBattery < 80) {
          optionIndex = 1;
        } else if (droneBattery >= 80 && droneBattery < 90) {
          optionIndex = 2;
        } else {
          optionIndex = 3;
        }

        return {
          ...subquestion, // copy other properties
          specificAnswer: subquestion.options[optionIndex], // add specific answer
        };
      });
    } else if (question.number === 2) {
      specificAnswer = question.subquestions.map((subquestion, index) => {
        const droneSpeed = allDronesCurrentData[index]['horizontal_speed'];
        let optionIndex;

        if (droneSpeed < 5) {
          optionIndex = 0;
        } else if (droneSpeed >= 5 && droneSpeed < 10) {
          optionIndex = 1;
        } else if (droneSpeed >= 10 && droneSpeed < 20) {
          optionIndex = 2;
        } else {
          optionIndex = 3;
        }

        return {
          ...subquestion, // copy other properties
          specificAnswer: subquestion.options[optionIndex], // add specific answer
        };
      });
    } else if (question.number === 3) {
      specificAnswer = question.subquestions.map((subquestion, index) => {
        const droneDistance = allDronesCurrentData[index]['distance'];
        let optionIndex;

        if (droneDistance < 1000) {
          optionIndex = 0;
        } else if (droneDistance >= 1000 && droneDistance < 2000) {
          optionIndex = 1;
        } else if (droneDistance >= 2000 && droneDistance < 5000) {
          optionIndex = 2;
        } else {
          optionIndex = 3;
        }

        return {
          ...subquestion, // copy other properties
          specificAnswer: subquestion.options[optionIndex], // add specific answer
        };
      });
    }

    return {
      ...question, // copy other properties
      subquestions: specificAnswer // replace with new subquestions that include specific answers
    };
  });
}

const Questionnaire = forwardRef(({ onSubmit, sceneCounter, allDronesCurrentData, droneData }, ref) => {

  const droneBlocks = new Array(4).fill(null);

  const [selectedQuestion, setSelectedQuestion] = useState([]);

  // Initialize selectedOptions state
  const [selectedOptions, setSelectedOptions] = useState({});

  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [answersGenerated, setAnswersGenerated] = useState(false);

  const [non_critical_questions, setNonCriticalQuestions] = useState([]);
  const [questionsToRender, setQuestionsToRender] = useState([]);

  const allNonCritical = allDronesCurrentData.every((droneDataSeries) => droneDataSeries.critical_situation === 0);

  useEffect(() => {
  
    const nonCritQuestions = buildNonCriticalQuestions(only_non_critical_questions,allDronesCurrentData);
    setNonCriticalQuestions(nonCritQuestions);

    const shuffledQuestions = shuffle(nonCritQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, 2);
  
    setQuestionsToRender(selectedQuestions);
  }, [allDronesCurrentData]);


  // console.log('critical_questions',critical_questions);
  // console.log('non_critical_questions',non_critical_questions);

  // Handle option changes like this
  const handleOptionChange = (questionIndex, optionIndex, subQuestionIndex) => {
    setSelectedOptions(prevOptions => {
      const newOptions = { ...prevOptions };

      if (typeof subQuestionIndex === 'number') {
        newOptions[questionIndex] = newOptions[questionIndex] || [];
        newOptions[questionIndex][subQuestionIndex] = optionIndex;
      } else {
        newOptions[questionIndex] = optionIndex;
      }

      return newOptions;
    });
  };

  const handleSubmit = () => {
    if (Object.keys(selectedOptions).length > 0) {
      const userAnswers = [];
      const correctAnswers = [];
      
      console.log('questionsToRender', questionsToRender); // New line
      console.log('selectedOptions', selectedOptions); // New line
      for (let i = 0; i < questionsToRender.length; i++) {
        const question = questionsToRender[i];
        const selectedOption = selectedOptions[i];
        console.log('question', question); // New line
        console.log('selectedOption', selectedOption); // New line
        if (Array.isArray(selectedOption)) {
          const userSubAnswers = [];
          const correctSubAnswers = [];
          for (let j = 0; j < question.subquestions.length; j++) {
            const subQuestion = question.subquestions[j];
            const selectedSubOption = selectedOption[j];
            
            console.log('selectedSubOption', selectedSubOption); 
            console.log('subQuestion', subQuestion); 
            console.log('subQuestion.options', subQuestion.options); 
            if (selectedSubOption !== undefined) {
              userSubAnswers.push(subQuestion.options[selectedSubOption]);
            } else {

              userSubAnswers.push("Not answered");
            }
          console.log(question.specificAnswer)

          }
          userAnswers.push(userSubAnswers);
          correctAnswers.push(correctSubAnswers);
        } else {
          console.log('question.options', question.options); // New line
          if (selectedOption !== undefined) {
            userAnswers.push(question.options[selectedOption]);
          } else {
            userAnswers.push("Not answered");
          }
          correctAnswers.push(question.answer);
        }
      }
      // console.log('correctAnswers',correctAnswers)
      setCorrectAnswers(correctAnswers)
      onSubmit([userAnswers, correctAnswers]);
    }
  };
  

  useEffect(() => {
    if (!answersGenerated) {
      // setCorrectAnswers([...first_questions, ...critical_questions, ...non_critical_questions].map((q) => q.answer));
      setCorrectAnswers([non_critical_questions].map((q) => q.answer));
      setAnswersGenerated(true);
    }
  }, [answersGenerated, non_critical_questions]);

  useEffect(() => {
    ref.current = { handleSubmit };
  }, [handleSubmit]);

  const renderQuestion = (question, index) => {
    return (
      <div className="question" key={index}>
        <h4>{question.question}</h4>
        {question.subquestions && 
          <table>
            <thead>
              <tr>
                <th></th>
                {question.subquestions.map((subQuestion, subQuestionIndex) => (
                  <th key={subQuestionIndex}>{subQuestion.drone}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {question.subquestions[0].options.map((option, optionIndex) => (
                <tr key={optionIndex}>
                  <td>{option}</td>
                  {question.subquestions.map((subQuestion, subQuestionIndex) => (
                    <td key={subQuestionIndex}>
                      <input
                        type="radio"
                        name={`question_${index}_subquestion_${subQuestionIndex}`}
                        value={option}
                        checked={selectedOptions[index] && selectedOptions[index][subQuestionIndex] === optionIndex}
                        onChange={() => handleOptionChange(index, optionIndex, subQuestionIndex)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    );
  };

  return (
    <div className="drone-monitor-container">
    <div className="container">
      {!droneData[sceneCounter - 1] ? (
        <p>Loading...</p>
      ) : (
        droneBlocks.slice(0, 4).map((_, index) => (
          <DroneBlock
            droneData={droneData[index]}
            droneNumber={index + 1}
            highlightStatus={0}
            isFrozen={true}
            latestData={''}
          />
        ))
      )}
    </div>
    <div className="questionnaire">
      <h3>Questionnaire</h3>
      {questionsToRender.length!==0?questionsToRender.map(renderQuestion):"Loading"}
    </div>
  </div>

  );
});

export default Questionnaire;