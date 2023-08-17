import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import { styled } from 'styled-components';
import 'github-markdown-css/github-markdown-dark.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import APPS_CONFIG, { DockerAppProperties } from '../../../config/apps';

const MarkdownContainer = styled.div`
  .markdown-body {
    width: 94%;
    overflow: scroll;
    position: absolute;
    left: 0;
    padding-left: 3%;
    padding-right: 3%;
    padding-top: 2%;
    padding-bottom: 2%;
    height: 96%;
    background-color: black;
  }
`;

export default function AppDocs({ close }: { close: any }) {
  const { appId } = useParams();
  const appConifg = APPS_CONFIG.apps.filter(
    (app) => app.id === appId
  )[0] as DockerAppProperties;
  const [markdownDocs, setMarkdownDocs] = useState<string>('');

  useEffect(() => {
    (async () => {
      if (!appConifg.markdownDocsUrl) return;
      const response = await axios.get(appConifg.markdownDocsUrl);
      console.log('this is md - ', response.data);
      setMarkdownDocs(response.data);
    })();
  }, []);

  return (
    <MarkdownContainer>
      <ReactMarkdown
        className="markdown-body"
        remarkPlugins={[remarkGfm]}
        linkTarget={'_blank'}
        skipHtml
      >
        {markdownDocs}
      </ReactMarkdown>
      <FontAwesomeIcon
        icon={faClose}
        size="2x"
        color="#777"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          cursor: 'pointer',
        }}
        onClick={close}
      />
    </MarkdownContainer>
  );
}
