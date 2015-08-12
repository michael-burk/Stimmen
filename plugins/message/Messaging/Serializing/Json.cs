using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using VVVV.Core.Logging;
using VVVV.Pack.Messaging;
using VVVV.PluginInterfaces.V2;

namespace VVVV.Nodes.Messaging.Serializing
{
        #region PluginInfo
        [PluginInfo(Name = "AsJson", Category = "Message", Help = "Filter Messages", Tags = "Dynamic, velcrome, JSON")]
        #endregion PluginInfo
        public class MessageAsJsonStringNode : IPluginEvaluate
        {
            #pragma warning disable 649, 169
            [Input("Input")]
            IDiffSpread<Message> FInput;

            [Output("String", AutoFlush = false)]
            ISpread<string> FOutput;

            //			private MessageResolver FResolver;

            [Import()]
            protected ILogger FLogger;

            #pragma warning restore

            public MessageAsJsonStringNode()
            {
                //				FResolver = new MessageResolver();
            }


            public void Evaluate(int SpreadMax)
            {
                if (!FInput.IsChanged) return;

                FOutput.SliceCount = SpreadMax;
                JsonSerializer ser = new JsonSerializer();

                JsonSerializerSettings settings = new JsonSerializerSettings();
                settings.Formatting = Formatting.None;
                settings.TypeNameHandling = TypeNameHandling.None;

                for (int i = 0; i < SpreadMax; i++)
                {
                    string s = JsonConvert.SerializeObject(FInput[i], settings);

                    FOutput[i] = s != null ? s : "";
                }
                FOutput.Flush();
                //				FStreamOutput.Flush();
            }
        }

        #region PluginInfo
        [PluginInfo(Name = "AsMessage", Category = "Message, Json", Help = "Filter Messages", Tags = "Dynamic, velcrome, JSON")]
        #endregion PluginInfo
        public class JsonStringAsMessageNode : IPluginEvaluate
        {
            #pragma warning disable 649, 169
            [Input("Input")]
            IDiffSpread<string> FInput;

            [Output("Message", AutoFlush = false)]
            ISpread<Message> FOutput;

            private MessageResolver FResolver;

            [Import()]
            protected ILogger FLogger;
            #pragma warning restore

            public JsonStringAsMessageNode()
            {

            }

            public void Evaluate(int SpreadMax)
            {

                //		if (!FInput.IsChanged) return;

                SpreadMax = FInput.SliceCount;
                FOutput.SliceCount = SpreadMax;

                for (int i = 0; i < SpreadMax; i++)
                {

                    FOutput[i] = JsonConvert.DeserializeObject<Message>(FInput[i]);
                }

                FOutput.Flush();
            }
        }

}
