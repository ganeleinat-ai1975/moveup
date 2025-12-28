import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useLanguage } from '../LanguageContext';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

export default function RichTextEditor({ value, onChange }) {
  const { language, direction } = useLanguage();
  
  return (
    <div className="bg-white text-gray-900" dir={direction}>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
      />
      <style>{`
        .ql-editor {
          direction: ${direction};
          min-height: 200px;
          line-height: 1.4;
        }

        /* Default text alignment based on language */
        .ql-editor p, .ql-editor li {
            text-align: ${language === 'he' ? 'right' : 'left'};
            line-height: 1.4;
            margin: 0.25em 0;
        }
        
        /* Allow Quill's alignment classes to override */
        .ql-editor .ql-align-left { text-align: left !important; }
        .ql-editor .ql-align-center { text-align: center !important; }
        .ql-editor .ql-align-right { text-align: right !important; }
        .ql-editor .ql-align-justify { text-align: justify !important; }

        .ql-editor.ql-blank::before{
          direction: ${direction};
          text-align: ${language === 'he' ? 'right' : 'left'};
          font-style: normal;
          color: rgba(0,0,0,0.4);
        }

        /* Improved link styling */
        .ql-editor a {
          color: #005e6c;
          text-decoration: underline;
        }

        /* Header styling */
        .ql-editor h1 { font-size: 2em; font-weight: bold; margin: 0.5em 0; line-height: 1.3; }
        .ql-editor h2 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; line-height: 1.3; }
        .ql-editor h3 { font-size: 1.17em; font-weight: bold; margin: 0.5em 0; line-height: 1.3; }
        
        /* List styling */
        .ql-editor ul, .ql-editor ol {
          margin: 0.25em 0;
          padding-right: ${language === 'he' ? '1.5em' : '0'};
          padding-left: ${language === 'he' ? '0' : '1.5em'};
        }
        
        .ql-editor li {
          margin: 0.1em 0;
        }
      `}</style>
    </div>
  );
}